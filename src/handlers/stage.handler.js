import { getGameAssets } from '../init/assets.js';
import { getStage, setStage } from '../models/stage.model.js';

export const moveStageHandler = (userId, payload) => {
  //유저는 스테이지를 하나씩 올라갈 수 있다.1->2 , 2->3
  //유저는 일정 점수가 되면 다음 스테이지로 이동한다.
  //유저의 현재 스테이지, 타겟 스테이지를 서버에게 보내주게 됨 이것에 대한 검증절차가 필요함
  let currentStages = getStage(userId);
  if (!currentStages.length) {
    return { status: 'fail', message: '유저 스테이지정보를 찾을 수 없음' };
  }

  //오름차순 -> 가장 큰 스테이지 ID를 확인 <-유저의 현재 스테이지
  currentStages.sort((a, b) => {
    a.id - b.id;
  });
  const currentStage = currentStages[currentStages.length - 1];

  //클라이언트 VS 서버 비교
  if (currentStage.id !== payload.currentStage) {
    return { status: 'fail', message: '스테이지 정보가 다릅니다' };
  }

  //점수 검증 로직
  const serverTime = Date.now(); // 현재 타임스태프 구함
  const elapedTime = (serverTime - currentStage.timestamp) / 1000; //ms기준이라서 나누기 1000 하면 1초당 할수있음

  //1스테이지 ->2스테이지로 넘어가는 가정
  //5 = 임의로 정한 오차범위 서버연결 지연을 고려함
  if (elapedTime < 100 || elapedTime > 105) {
    //오차 고려해서 지정했음,스테이지 넘어가면 안되는데 넘어감
    return { status: 'fail', messgae: '시간오류' };
  } //@과제

  //target 스테이지에 대한 검증 <- 게임에셋에 존재하는가?
  const { stages } = getGameAssets();
  if (!stages.data.some((stage) => stage.id === payload.targetStage)) {
    //스테이지 포함된게 없으면 에러
    return { status: 'fail', message: '스테이지가 존재하지 않습니다' };
  }

  //유저 현재 점수랑 에셋 점수랑 비교해서 더 높아야 통과 가능한건 @@과제로@@

  setStage(userId, payload.targetStage, serverTime); //다음스테이지부터 새로 시작하기위해 serverTime
  return { status: 'succes' };
};

//movestage가 어떤식으로 검증될지 코드로 표현
