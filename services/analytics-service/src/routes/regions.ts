import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { RegionOverview } from '../types/index.js';

interface RegionParams {
  id: string;
}

export async function regionsRoutes(app: FastifyInstance) {
  // GET /analytics/regions - All regions
  app.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const regions: RegionOverview[] = [
      { id: 'northeast', name: 'Northeast', population: 56000000, activePods: 45, participationRate: 72, tblScore: 82 },
      { id: 'southeast', name: 'Southeast', population: 84000000, activePods: 62, participationRate: 65, tblScore: 76 },
      { id: 'midwest', name: 'Midwest', population: 68000000, activePods: 52, participationRate: 58, tblScore: 79 },
      { id: 'southwest', name: 'Southwest', population: 42000000, activePods: 38, participationRate: 71, tblScore: 85 },
      { id: 'west', name: 'West', population: 78000000, activePods: 58, participationRate: 68, tblScore: 88 },
    ];

    return reply.send({
      success: true,
      data: regions,
      total: regions.length,
    });
  });

  // GET /analytics/regions/:id - Region detail
  app.get<{ Params: RegionParams }>('/:id', async (request, reply) => {
    const { id } = request.params;

    const regionDetails = {
      id,
      name: id.charAt(0).toUpperCase() + id.slice(1),
      population: 56000000,
      activePods: 45,
      participationRate: 72,
      tblScore: 82,
      tbl: {
        people: 78,
        planet: 85,
        profit: 72,
      },
      pods: [
        { id: 'pod-1', name: 'Metro Area 1', population: 2500000, participation: 75 },
        { id: 'pod-2', name: 'Metro Area 2', population: 1800000, participation: 71 },
        { id: 'pod-3', name: 'Rural District 1', population: 450000, participation: 68 },
        { id: 'pod-4', name: 'Suburban Zone A', population: 920000, participation: 73 },
      ],
      trends: {
        participation: [
          { month: 'Jul', rate: 68 },
          { month: 'Aug', rate: 69 },
          { month: 'Sep', rate: 70 },
          { month: 'Oct', rate: 71 },
          { month: 'Nov', rate: 72 },
          { month: 'Dec', rate: 72 },
        ],
        tblScore: [
          { month: 'Jul', score: 78 },
          { month: 'Aug', score: 79 },
          { month: 'Sep', score: 80 },
          { month: 'Oct', score: 81 },
          { month: 'Nov', score: 82 },
          { month: 'Dec', score: 82 },
        ],
      },
    };

    return reply.send({
      success: true,
      data: regionDetails,
    });
  });

  // GET /analytics/regions/compare - Region comparison
  app.get('/compare', async (
    request: FastifyRequest<{ Querystring: { regions?: string; metrics?: string } }>,
    reply: FastifyReply
  ) => {
    const { regions: regionIds, metrics } = request.query;

    const comparison = {
      regions: ['northeast', 'west'],
      metrics: {
        participation: { northeast: 72, west: 68 },
        tblScore: { northeast: 82, west: 88 },
        billPassage: { northeast: 75, west: 82 },
        citizenSatisfaction: { northeast: 78, west: 85 },
        efficiency: { northeast: 70, west: 79 },
      },
      rankings: {
        overall: [
          { region: 'West', rank: 1, score: 88 },
          { region: 'Southwest', rank: 2, score: 85 },
          { region: 'Northeast', rank: 3, score: 82 },
          { region: 'Midwest', rank: 4, score: 79 },
          { region: 'Southeast', rank: 5, score: 76 },
        ],
      },
    };

    return reply.send({
      success: true,
      data: comparison,
    });
  });
}
