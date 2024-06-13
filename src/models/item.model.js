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
