import { CongressBill, CongressVote, CongressMember } from './types.js';

export interface ParsedBillContent {
  title: string;
  shortTitle?: string;
  sections: BillSection[];
  enactingClause?: string;
  definitions?: BillDefinition[];
}

export interface BillSection {
  number: string;
  heading?: string;
  text: string;
  subsections?: BillSubsection[];
}

export interface BillSubsection {
  id: string;
  text: string;
}

export interface BillDefinition {
  term: string;
  definition: string;
}

export class CongressGovParser {
  parseXmlBill(xml: string): ParsedBillContent {
    const titleMatch = xml.match(/<dc:title>([^<]+)<\/dc:title>/);
    const shortTitleMatch = xml.match(/<short-title>([^<]+)<\/short-title>/);

    const sections = this.extractSections(xml);
    const enactingClause = this.extractEnactingClause(xml);
    const definitions = this.extractDefinitions(xml);

    return {
      title: titleMatch?.[1] ?? 'Untitled',
      shortTitle: shortTitleMatch?.[1],
      sections,
      enactingClause,
      definitions,
    };
  }

  private extractSections(xml: string): BillSection[] {
    const sections: BillSection[] = [];
    const sectionRegex = /<section[^>]*>[\s\S]*?<\/section>/g;
    let match;

    while ((match = sectionRegex.exec(xml)) !== null) {
      const sectionXml = match[0];
      const numberMatch = sectionXml.match(/id="[^"]*_s(\d+)"/);
      const headingMatch = sectionXml.match(/<header>([^<]+)<\/header>/);
      const textMatch = sectionXml.match(/<text>([^<]+)<\/text>/);

      if (numberMatch || headingMatch || textMatch) {
        sections.push({
          number: numberMatch?.[1] ?? '0',
          heading: headingMatch?.[1],
          text: textMatch?.[1] ?? '',
          subsections: this.extractSubsections(sectionXml),
        });
      }
    }

    return sections;
  }

  private extractSubsections(sectionXml: string): BillSubsection[] {
    const subsections: BillSubsection[] = [];
    const subsectionRegex = /<subsection[^>]*id="([^"]*)"[^>]*>[\s\S]*?<text>([^<]*)<\/text>/g;
    let match;

    while ((match = subsectionRegex.exec(sectionXml)) !== null) {
      subsections.push({
        id: match[1],
        text: match[2],
      });
    }

    return subsections;
  }

  private extractEnactingClause(xml: string): string | undefined {
    const match = xml.match(/<enacting-formula>([^<]+)<\/enacting-formula>/);
    return match?.[1];
  }

  private extractDefinitions(xml: string): BillDefinition[] {
    const definitions: BillDefinition[] = [];
    const defRegex = /<term>([^<]+)<\/term>[\s\S]*?<text>([^<]+)<\/text>/g;
    let match;

    while ((match = defRegex.exec(xml)) !== null) {
      definitions.push({
        term: match[1],
        definition: match[2],
      });
    }

    return definitions;
  }

  normalizeBillStatus(latestAction?: string): string {
    if (!latestAction) return 'unknown';

    const actionLower = latestAction.toLowerCase();

    if (actionLower.includes('became public law') || actionLower.includes('signed by president')) {
      return 'enacted';
    }
    if (actionLower.includes('passed house') && actionLower.includes('passed senate')) {
      return 'passed_both_chambers';
    }
    if (actionLower.includes('passed house') || actionLower.includes('passed senate')) {
      return 'passed_one_chamber';
    }
    if (actionLower.includes('reported') || actionLower.includes('ordered to be reported')) {
      return 'in_committee';
    }
    if (actionLower.includes('referred to')) {
      return 'referred';
    }
    if (actionLower.includes('vetoed')) {
      return 'vetoed';
    }
    if (actionLower.includes('pocket vetoed')) {
      return 'pocket_vetoed';
    }
    if (actionLower.includes('failed')) {
      return 'failed';
    }

    return 'introduced';
  }

  mapPolicyAreaToCategory(policyArea?: string): string {
    if (!policyArea) return 'other';

    const mappings: Record<string, string> = {
      'agriculture and food': 'agriculture',
      'armed forces and national security': 'defense',
      'civil rights and liberties, minority issues': 'civil_rights',
      'commerce': 'commerce',
      'crime and law enforcement': 'law_enforcement',
      'economics and public finance': 'economy',
      'education': 'education',
      'emergency management': 'emergency',
      'energy': 'energy',
      'environmental protection': 'environment',
      'families': 'social_services',
      'finance and financial sector': 'finance',
      'foreign trade and international finance': 'trade',
      'government operations and politics': 'government',
      'health': 'health',
      'housing and community development': 'housing',
      'immigration': 'immigration',
      'international affairs': 'foreign_affairs',
      'labor and employment': 'labor',
      'law': 'law',
      'native americans': 'native_affairs',
      'public lands and natural resources': 'public_lands',
      'science, technology, communications': 'technology',
      'social welfare': 'social_services',
      'sports and recreation': 'recreation',
      'taxation': 'taxation',
      'transportation and public works': 'transportation',
      'water resources development': 'infrastructure',
    };

    const normalized = policyArea.toLowerCase();
    return mappings[normalized] ?? 'other';
  }

  extractVotePosition(voteText?: string): 'yea' | 'nay' | 'present' | 'not_voting' {
    if (!voteText) return 'not_voting';

    const textLower = voteText.toLowerCase();
    if (textLower.includes('yea') || textLower.includes('aye') || textLower.includes('yes')) {
      return 'yea';
    }
    if (textLower.includes('nay') || textLower.includes('no')) {
      return 'nay';
    }
    if (textLower.includes('present')) {
      return 'present';
    }
    return 'not_voting';
  }

  formatMemberName(member: CongressMember): string {
    if (member.fullName) return member.fullName;
    return `${member.firstName} ${member.lastName}`;
  }

  getChamberFromType(billType: string): 'house' | 'senate' {
    const houseTypes = ['hr', 'hres', 'hjres', 'hconres'];
    return houseTypes.includes(billType.toLowerCase()) ? 'house' : 'senate';
  }
}

export function createCongressGovParser(): CongressGovParser {
  return new CongressGovParser();
}
