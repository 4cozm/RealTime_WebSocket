import { moveStageHandler } from './stage.handler.js';
import { spawnItem, gameEnd, gameStart, earnItem } from './game.handler.js';

const handlerMappings = {
  2: gameStart,
  3: gameEnd,
  11: moveStageHandler,
  20: spawnItem,
  21: earnItem,
};

export default handlerMappings;
