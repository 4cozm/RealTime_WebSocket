import { moveStageHandler } from './stage.handler.js';
import { spawnItem, gameEnd, gameStart } from './game.handler.js';

const handlerMappings = {
  2: gameStart,
  3: gameEnd,
  11: moveStageHandler,
  20: spawnItem,
};

export default handlerMappings;
