import { getStage, setStage } from '../models/stage.model.js';
import { getItems } from '../models/item.model.js';
import { getGameAssets } from '../init/assets.js';

export const moveStageHandler = (userId, payload) => {
  const { stages } = getGameAssets();
  // 유저의 현재 스테이지 배열을 가져오고, 최대 스테이지 ID를 찾는다.
  let currentStages = getStage(userId);
  if (!currentStages.length) {
    return { status: 'fail', message: 'No stages found for user' };
  }

  // 오름차순 정렬 후 가장 큰 스테이지 ID 확인 = 가장 상위의 스테이지 = 현재 스테이지
  currentStages.sort((a, b) => a.id - b.id);
  const currentStage = currentStages[currentStages.length - 1];
  //currentStage { id: 1000, timestamp: 1718250113693 }

  // payload 의 currentStage 와 비교
  if (currentStage.id !== payload.currentStage) {
    return { status: 'fail', message: 'Current stage mismatch' };
  }

  //currentStage의 테이블 정보
  const currentStageTable = stages.data.find((index) => {
    return index.id === currentStage.id;
  });
  const tolerance = (currentStageTable.id - 1000) * 12; //검증 오차값에 대한 정보
  //스테이지 * 12 정도가 적절한 오차값, 아이템 점수의 증가량과 초당 점수 증가량을 고려한 수치

  //다음 스테이지에 대한 정보
  const nextStage = stages.data.find((index) => {
    return index.id === currentStage.id + 1;
  });

  //유저가 획득한 아이템 점수의 총합을 계산한다
  const earnItemArray = getItems(userId);
  let itemScore = 0;
  earnItemArray.forEach((index) => {
    itemScore += index.score;
  });
  // 점수 검증
  const serverTime = Date.now();
  const elapsedTime = (serverTime - currentStage.timestamp) / 1000; // 초 단위로 계산

  // 1초당 1점, 100점이상 다음스테이지 이동, 오차범위 5
  // 클라이언트와 서버 간의 통신 지연시간을 고려해서 오차범위 설정
  // elapsedTime 은 100 이상 105 이하 일 경우만 통과
  if (
    !(
      nextStage.score - tolerance <= payload.score &&
      payload.score <= nextStage.score + tolerance
    )
  ) {
    // 다음 스테이지의 기준 점수가 유저가 보낸 데이터의 점수 이상인가?
    return {
      status: 'fail',
      message: '스테이지를 이동할만큼 점수를 가지고 있지 않습니다',
    };
  }

  const onlyTimeScore = elapsedTime * currentStageTable.scorePerSecond;
  if (
    !(
      payload.score - tolerance <= onlyTimeScore + itemScore &&
      onlyTimeScore + itemScore <= payload.score + tolerance
    )
  ) {
    return {
      status: 'fail',
      message:
        '아이템 점수와 시간점수의 합이 전송받은 점수와 일치하지 않습니다',
    };
  }

  // 게임 에셋에서 다음 스테이지의 존재 여부 확인

  if (!stages.data.some((stage) => stage.id === payload.targetStage)) {
    return { status: 'fail', message: 'Target stage does not exist' };
  }

  // 유저의 다음 스테이지 정보 업데이트 + 현재 시간
  setStage(userId, payload.targetStage, serverTime);
  return { status: 'success' };
};
