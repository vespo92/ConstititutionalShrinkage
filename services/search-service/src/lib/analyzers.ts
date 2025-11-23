/**
 * Custom Elasticsearch Analyzers
 *
 * Specialized text analyzers for legal and legislative content.
 */

export const legislationAnalyzer = {
  analyzer: {
    legislation_analyzer: {
      type: 'custom',
      tokenizer: 'standard',
      filter: [
        'lowercase',
        'legal_synonyms',
        'english_stemmer',
        'trim',
      ],
    },
    legal_search_analyzer: {
      type: 'custom',
      tokenizer: 'standard',
      filter: [
        'lowercase',
        'legal_synonyms',
        'english_stemmer',
      ],
    },
    autocomplete_analyzer: {
      type: 'custom',
      tokenizer: 'standard',
      filter: [
        'lowercase',
        'edge_ngram_filter',
      ],
    },
    autocomplete_search_analyzer: {
      type: 'custom',
      tokenizer: 'standard',
      filter: [
        'lowercase',
      ],
    },
  },
  filter: {
    legal_synonyms: {
      type: 'synonym',
      synonyms: [
        // Legal terms
        'law, legislation, statute, act, ordinance',
        'vote, ballot, poll, referendum',
        'citizen, person, individual, resident',
        'region, district, area, zone, jurisdiction',
        'bill, proposal, measure, resolution',
        'amendment, modification, revision, change',

        // Government terms
        'government, administration, authority',
        'representative, delegate, legislator, official',
        'committee, board, council, commission',
        'constitution, charter, fundamental law',

        // Process terms
        'approve, pass, enact, ratify',
        'reject, veto, deny, defeat',
        'propose, introduce, submit, present',
        'debate, discuss, deliberate, consider',

        // Impact terms
        'impact, effect, consequence, result',
        'benefit, advantage, gain, improvement',
        'cost, expense, expenditure, spending',
        'tax, levy, duty, tariff',

        // Timeline terms
        'sunset, expire, terminate, end',
        'effective, active, in force, operative',
        'pending, waiting, under consideration',
      ],
    },
    english_stemmer: {
      type: 'stemmer',
      language: 'english',
    },
    edge_ngram_filter: {
      type: 'edge_ngram',
      min_gram: 2,
      max_gram: 20,
    },
  },
};

/**
 * Index settings with custom analyzers
 */
export function getIndexSettings() {
  return {
    analysis: legislationAnalyzer,
    index: {
      number_of_shards: 1,
      number_of_replicas: 0,
      refresh_interval: '1s',
    },
  };
}

/**
 * Common field mappings with autocomplete support
 */
export const commonFieldMappings = {
  titleField: (analyzerName: string = 'legislation_analyzer') => ({
    type: 'text',
    analyzer: analyzerName,
    fields: {
      keyword: { type: 'keyword' },
      suggest: {
        type: 'text',
        analyzer: 'autocomplete_analyzer',
        search_analyzer: 'autocomplete_search_analyzer',
      },
    },
  }),

  contentField: (analyzerName: string = 'legislation_analyzer') => ({
    type: 'text',
    analyzer: analyzerName,
  }),

  keywordField: () => ({
    type: 'keyword',
  }),

  dateField: () => ({
    type: 'date',
  }),

  numericField: (type: 'integer' | 'float' | 'long' = 'integer') => ({
    type,
  }),

  tagsField: () => ({
    type: 'keyword',
  }),
};
