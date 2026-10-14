import { asyncHandler } from '../utils/asyncHandler.js';

export function createMinhasRotasController(minhasRotasService) {
  return {
    listar: asyncHandler(async (req, res) => {
      const resultado = await minhasRotasService.listar(req.user.id, req.query);
      res.json(resultado);
    }),
  };
}
