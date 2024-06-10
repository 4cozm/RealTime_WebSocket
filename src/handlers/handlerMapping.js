import { gameEnd, gameStart } from './game.handler';
import { moveStageHandler } from './stage.handler';
//매핑하는 핸들러
const handlerMappings = {
  2: gameStart,
  3: gameEnd,
  11: moveStageHandler,
};

export default handlerMappings;
