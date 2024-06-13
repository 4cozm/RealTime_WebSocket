//유저 아이템 습득 기록을 저장하는 파일,저장된 값은 스테이지 이동시 점수 검증 계산에 쓰임

const items = {};

export const createItems = (uuid) => {
  items[uuid] = []; // 초기 아이템 배열 생성
};

export const getItems = (uuid) => {
  return items[uuid];
};

export const setItems = (uuid, id, score) => {
  return items[uuid].push({ id, score });
};

export const clearItems = (uuid) => {
  return (items[uuid] = []);
};
