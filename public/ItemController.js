import Item from './Item.js';
import { sendEvent } from './Socket.js';

class ItemController {
  INTERVAL_MIN = 0;
  INTERVAL_MAX = 12000;
  nextInterval = null;
  itemUnlockTable;
  unlockedItems = [1];
  currentStage;
  items = [];

  constructor(ctx, itemImages, scaleRatio, speed) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.itemImages = itemImages;
    this.scaleRatio = scaleRatio;
    this.speed = speed;
    this.currentStage = 1001;
    this.fetchItemUnlockInfo();

    this.setNextItemTime();
  }

  async fetchItemUnlockInfo() {
    try {
      const response = await fetch('/item_unlock');
      this.itemUnlockTable = await response.json();
      console.log('아이템 해금 테이블 가져오기 성공');
    } catch (err) {
      console.error('아이템 해금 테이블 가져오기 실패');
    }
  }
  updateStage(stageId) {
    //Score.js의 인스턴스가 컨트롤 해줌
    this.currentStage = stageId;
    console.log('현재 ItemController의 스테이지:' + this.currentStage);
    const stageData = this.itemUnlockTable.data.find(
      (index) => index.stage_id == this.currentStage
    );
    if (stageData) {
      this.unlockedItems = Array.isArray(stageData.item_id)
        ? stageData.item_id
        : [stageData.item_id];
      console.log('해금된 아이템:' + this.unlockedItems);
    } else {
      console.log('아이템 해금 테이블에 대한 정보를 가져오지 못했습니다');
    }
  }

  setNextItemTime() {
    this.nextInterval = this.getRandomNumber(
      this.INTERVAL_MIN,
      this.INTERVAL_MAX
    );
  }

  getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  createItem() {
    const index = this.getRandomNumber(0, this.unlockedItems.length - 1);
    const pickItem = this.unlockedItems[index]; 
    const itemInfo = this.itemImages.find((index)=>index.id==pickItem);
    const x = this.canvas.width * 1.5;
    const y = this.getRandomNumber(10, this.canvas.height - itemInfo.height);

    const item = new Item(
      this.ctx,
      itemInfo.id,
      x,
      y,
      itemInfo.width,
      itemInfo.height,
      itemInfo.image
    );
    sendEvent(20,{id:itemInfo.id});
    this.items.push(item);
  }

  update(gameSpeed, deltaTime) {
    if (this.nextInterval <= 0) {
      this.createItem();
      this.setNextItemTime();
    }

    this.nextInterval -= deltaTime;

    this.items.forEach((item) => {
      item.update(this.speed, gameSpeed, deltaTime, this.scaleRatio);
    });

    this.items = this.items.filter((item) => item.x > -item.width);
  }

  draw() {
    this.items.forEach((item) => item.draw());
  }

  collideWith(sprite) {
    const collidedItem = this.items.find((item) => item.collideWith(sprite));
    if (collidedItem) {
      this.ctx.clearRect(
        collidedItem.x,
        collidedItem.y,
        collidedItem.width,
        collidedItem.height
      );
      return {
        itemId: collidedItem.id,
      };
    }
  }

  reset() {
    this.items = [];
  }
}

export default ItemController;
