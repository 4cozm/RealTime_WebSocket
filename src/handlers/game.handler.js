//게임 시작에 대한 핸들러

import { clearStage } from "../models/stage.model.js";

export const gameStart = (uuid, payload) => {
  const { stages } = getGameAssets();

  clearStage(uuid);
  //stages 배열에서 0번째 = 첫번째 스테이지
  //시간정보를 바로 저장함. 하지만 원래는 그 어떤 정보도 서버에 저장하지 않음 =>클라 정보는 언제든지 변조될수 있기에
  setStage(uuid, stages.data[0].id, payload.timestamp);
  console.log('스테이지:', getStage(uuid));

  return { status: 'success' };
};

export const gameEnd = (uuid, payload) => {
  //게임이 끝날당시 클라이언트는 서버 종료 타임스탬프와 총 점수를 줌
  const { timestamp: gameEndTime, score } = payload;
  //: 쓰면 이름바꿀수 있음
  const stages = getStage(uuid);

  if (!stages.length) {
    return { status: 'fail', message: '스테이지 없음' };
  }

  //각 스테이지의 지속 시간을 계산하여 총 점수 계산
  let totalScore = 0; //로직에 따라변경되게함
  stages.forEach((stage, index) => {
    let stageEndTime;
    if (index === stages.length - 1) {
      stageEndTime = gameEndTime; //스테이지 끝나는 시간은 게임이 끝나는시간
    } else {
      stageEndTime = stages[index + 1].timestamp; //이전스테이지니까 이전스테이지에 대한 타임스탬프를 들고와라
    }

    const stageDuration = (stageEndTime - stage.timestamp) / 1000;
    totalScore += stageDuration; //1초당 1점
    //나중에 과제로 스테이지 현황에 따라 점수가 달라지게 해야함
  });

  //점수와 타임스탬프 검증
  //오차범위 +-5 줌 (서버 상수에서 오차범위를 지정해주는것도 섹시함)
  if (Math.abs(score - totalScore) > 5) {
    return { status: 'fail', messgae: '스코어 검증 실패' };
  }

  //점수 기록을 DB 에 저장한다고 가정하면
  //여기 부분에서 코드 구현하면 될듯
  //setResult(userId,score,timestamp) 느낌

  return { status: 'success', message: 'game ended', score };
};
