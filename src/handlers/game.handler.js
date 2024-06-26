import { getGameAssets } from '../init/assets.js';
import { clearStage, getStage, setStage } from '../models/stage.model.js';
import { clearItems, getItems, setItems } from '../models/item.model.js';
import {getScore} from '../models/highScore.model.js'
import { assets } from '../app.js';
export const gameStart = (uuid, payload) => {
  const { stages } = getGameAssets();
  clearStage(uuid);
  clearItems(uuid);
  setStage(uuid, stages.data[0].id, payload.timestamp);
  
  console.log('Stage:', getStage(uuid));

  return { status: 'game start success',highScore:getScore() };
};

export const gameEnd = (uuid, payload) => {
  // 클라이언트에서 받은 게임 종료 시 타임스탬프와 총 점수
  const { timestamp: gameEndTime, score } = payload;
  const stages = getStage(uuid);
  const items = getItems(uuid);

  if (!stages.length) {
    return { status: 'fail', message: 'No stages found for user' };
  }

  // 각 스테이지의 지속 시간을 계산하여 총 점수 계산
  let totalScore = 0;
  stages.forEach((stage, index) => {
    let stageEndTime;
    if (index === stages.length - 1) {
      // 마지막 스테이지의 경우 종료 시간이 게임의 종료 시간
      stageEndTime = gameEndTime;
    } else {
      // 다음 스테이지의 시작 시간을 현재 스테이지의 종료 시간으로 사용
      stageEndTime = stages[index + 1].timestamp;
    }
    const stageDuration = (stageEndTime - stage.timestamp) / 1000; // 스테이지 지속 시간 (초 단위)
    totalScore += stageDuration; // 1초당 1점
  });

  // 점수와 타임스탬프 검증 (예: 클라이언트가 보낸 총점과 계산된 총점 비교)
  // 오차범위 5
  if (Math.abs(score - totalScore) > 5) {
    return { status: 'fail', message: 'Score verification failed' };
  }

  // 모든 검증이 통과된 후, 클라이언트에서 제공한 점수 저장하는 로직
  // saveGameResult(userId, clientScore, gameEndTime);
  // 검증이 통과되면 게임 종료 처리
  return { status: 'success', message: 'Game ended successfully', score };
};

export const spawnItem = (uuid, payload) => {
  try {
    const userUUID = parseInt(getStage(uuid)[0].id, 10); // 1스테이지 기준 1000 반환
    const item_unlock = assets.itemUnlocks;
    const stageInfo = item_unlock.data.find(
      (index) => index.stage_id === userUUID
    );
    if (!stageInfo) {
      return { status: 'fail', message: '찾을 수 없는 스테이지 정보입니다' };
    }

    if (!stageInfo.item_id.includes(payload.id)) {
      return { status: 'fail', message: '정상적인 아이템 생성이 아닙니다' };
    }

    return { status: 'success', message: '정상적인 아이템 생성입니다' };
  } catch (error) {
    console.error(error.message);
    return { status: 'error', message: '서버 오류가 발생했습니다' };
  }
};

export const earnItem = (uuid, payload) => {
  const itemTable = assets.items;
  const findById = itemTable.data.find((index) => index.id === payload.id);
  if (!findById) {
    return {
      status: 'error',
      message: '습득한 아이템에 대한 정보를 찾을 수 없습니다',
    };
  }
  if (findById.score != payload.score) {
    return {
      status: 'error',
      message: '습득한 아이템의 점수가 올바르지 않습니다',
    };
  }
  setItems(uuid, findById.id, findById.score);
  return { status: 'success', message: '정상적인 아이템 획득입니다' };
};


export const highScore = (uuid,payload)=>{
  return {broadcast:"true",payload:`${uuid}유저가 신기록 달성!! : ${payload.score}`}
}

