// 스테이지에 따라서 더 높은 점수 획득 구현
//1 스테이지 0점 => 1점씩
//2 스테이지 1000점 => 2점씩
//게임이 시작하자마자 위 데이터를 담을 바구니 필요
//key:uuid, value : array =>스테이지 정보는 배열이라서
const stages = {};

//스테이지 초기화
export const createStage = (uuid) => {
  stages[uuid] = [];
};
export const getStage = (uuid) => {
  return stages[uuid];
};

//게임 시작하면 시간도 받아야해서 timestamp추가 여기서 id는 스테이지의 id를 뜻함
export const setStage = (uuid, id, timestamp) => {
  return stages[uuid].push({ id, timestamp });
};

export const clearStage = (uuid) => {
  stages[uuid] = [];
}; //기록 지워주는 함수
