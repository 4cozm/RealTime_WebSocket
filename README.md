# 리얼타임 웹소켓 게임 서버 구현

![image](https://github.com/4cozm/RealTime_WebSocket/assets/49065386/4722ed3b-0c97-466a-a64b-45c0aa88ff9d)

### 파일 구조

```
├── assets                     // 게임 데이터
│   ├── item.json
│   ├── item_unlock.json
│   └── stage.json
├── package-lock.json
├── package.json
├── public                     // 프론트엔드 관련 파일들
│
├── readme.md                  // 프로젝트 README 파일
└── src                        // 서버 코드
    ├── app.js                 // 메인 애플리케이션 파일
    ├── constants.js           // 상수 정의 파일
    ├── handlers               // 비즈니스 로직 핸들러들
    │   ├── game.handler.js    // 게임 관련 핸들러
    │   ├── handlerMapping.js  // 핸들러 매핑 파일
    │   ├── helper.js          // 핸들러 보조 함수
    │   ├── register.handler.js
    │   └── stage.handler.js   // 스테이지 관련 핸들러
    ├── init                   // 필수 데이터, 기능 로드 관련 파일들
    │   ├── assets.js          // 자산 로드 관련 파일
    │   └── socket.js          // 소켓 관련 파일
    └── models                 // 모델 관련 파일들
        ├── highScore.model.js // 최고 점수 모델 파일
        ├── item.model.js      // 아이템 모델 파일
        ├── stage.model.js     // 스테이지 모델 파일
        └── user.model.js      // 사용자 모델 파일

```
### 패킷 구조 설계
     
  - 공통 패킷
    | 필드 명 | 타입 | 설명 |
    | --- | --- | --- |
    | handlerID | int | 요청을 처리할 서버 핸들러의 ID |
    | userId | int | 요청을 보내는 유저의 ID |
    | clientVersion | string | 현재 클라이언트 버전 (”1.0.0”) (고정) |
    | payload | JSON | 요청 내용 |
- 스테이지 이동
    
    
    | 필드 명 | 타입 | 설명 |
    | --- | --- | --- |
    | currentStage | int | 현재 스테이지 |
    | targetStage | int | 이동하는 스테이지 |

필수 구현 과제 - 구현목록

- [x]  시간에 따른 점수 획득
    - [x]  스테이지 구분
    - [x]  스테이지에 따른 점수 획득 구분
- [x]  아이템 획득
    - [x]  아이템 획득 시 점수 획득
    - [x]  스테이지 별 아이템 생성 구분
    - [x]  아이템 별 획득 점수 구분

도전 구현 과제 - 구현 목록

- [x]  broadcast 기능 추가
- [x]  가장 높은 점수 Record관리

### 시간에 따른 점수 획득

- 스테이지 구분
- 스테이지에 따른 점수 획득 구분

```jsx
update(deltaTime) {
    this.score += deltaTime * 0.001 * this.currentScorePersecond;
//this.currentScorePersecond는 스테이지 테이블의 초당 점수 배율의 값
    const nextStageScore =
      this.stageInfo.data[this.currentStageIndex].score + 100; //1단계->2단계 기준
    //1. 현재 스테이지의 최대 점수를 넘었는지 확인
    if (this.score >= nextStageScore && this.stageChange) {
      this.stageChange = false;
      //2. 다음 스테이지의 존재여부 확인
      if (this.currentStageIndex < this.stageInfo.data.length - 1) {
        //3. 스테이지 이동
        this.currentStageIndex++;
        //4. 스테이지별 알맞는 점수 배율을 적용
        this.currentScorePersecond =
          this.stageInfo.data[this.currentStageIndex].scorePerSecond;
        this.itemController.updateStage(
          this.stageInfo.data[this.currentStageIndex + 1].id
        );
        //5. 서버에 이벤트 전송
        sendEvent(11, {
          currentStage: this.stageInfo.data[this.currentStageIndex - 1].id,
          targetStage: this.stageInfo.data[this.currentStageIndex].id,
          score: this.score,
        });
        this.stageChange = true;
      }
    }
  }
```

Score 인스턴스 생성시 생성자에 스테이지 테이블을 받아오는 fetch문을 구현했습니다

```jsx
  async fetchStageInfo() {
    try {
      const response = await fetch('/stage');
      this.stageInfo = await response.json();
      this.currentScorePersecond = this.stageInfo.data[0].scorePerSecond;
    } catch (err) {
      console.error('스테이지 데이터 가져오기 실패');
    }
  }
```

받아온 스테이지 테이블을 기반으로 아래와 같은 사항들을 참조해 기능을 구현 하였습니다.

1. 다음 스테이지에 도달하기 위한 점수
2. 다음 스테이지의 존재 여부
3. 현재 스테이지의 초당 점수

### 아이템 획득

- 스테이지별 아이템 생성 구분
- 아이템 획득시 점수 획득
- 아이템 별 획득 점수 구분

아이템의 생성을 담당하는 ItemController의 인스턴스에 item_unlock.json 테이블을 받아옵니다.

```jsx
  async fetchItemUnlockInfo() {
    try {
      const response = await fetch('/item_unlock');
      this.itemUnlockTable = await response.json();
    } catch (err) {
      console.error('아이템 해금 테이블 가져오기 실패');
    }
  }
```

스테이지에 알맞는 아이템을 해금해 주기 위해서는 현재 스테이지가 어느 스테이지 인지 확인할 수 있어야 합니다.

이를 위해 의존성 주입을 통해 Score인스턴스가 ItemController의 인스턴스를 참조하도록 구성하였습니다.

```jsx
  itemController = new ItemController(ctx, itemImages, scaleRatio, GROUND_SPEED);

  score = new Score(ctx, scaleRatio,itemController);
```

이로인해 Score인스턴스 에서 스테이지가 변경될때, ItemController 인스턴스로 해당 정보를 전달할 수 있게 되었습니다.

```jsx
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
```

해금에 대한 정보를 찾은뒤 해당 정보를 createItem()에 적용하였습니다.

```jsx
createItem() {
    const index = this.getRandomNumber(0, this.unlockedItems.length - 1);
    const pickItem = this.unlockedItems[index]; 
    const itemInfo = this.itemImages.find((index)=>index.id==pickItem);
		...
```

이렇게 스테이지별 아이템 생성을 구현했습니다.

아이템을 생성할때 서버로 아이템 생성에 대한 정보를 전송합니다

```jsx
sendEvent(20,{id:itemInfo.id});
//sendEvent(20) = spawnItem 에 대한 서버 검증 로직
```

서버는 이 정보와 서버에서 보유한 item_unlock 테이블을 대조해 해당 스테이지에 올바른 아이템이 생성되었는지 여부를 확인합니다

```jsx
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
```

아이템 획득시 Score 인스턴스의 getItem(itemId) 를 통해 점수를 획득합니다.
Score 인스턴스에 item에 대한 정보 테이블을 서버로부터 받아오게 끔 하여 itemId를 item 테이블과 대조하여 올바른 점수를 합산합니다.

```jsx
  getItem(itemId) {
    const earnItem = this.itemTable.data.find((index) => index.id == itemId);
    this.score += earnItem.score;
    }
```

또한 아이템 획득시 올바른 점수를 증감 시켰는지에 대한 여부를 서버에서 검증하는 코드를 추가했습니다

```jsx
//클라이언트에서 아이템 획득시 서버로 이벤트 발생
sendEvent(21, { id: itemId, score: earnItem.score });
//sendEvent(21) = earnItem
```

```jsx
//서버코드
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
```

### 추가 검증 작업

기존 코드의 경우 스테이지를 이동할때 서버로 이벤트를 전송하면
,스테이지에 머무른 시간 * 초당점수의 검증만 존재했습니다.

하지만 이 경우, 아이템 획득에 대한 점수 반영이 이루어지지 않아 오류가 발생했습니다.

아이템 획득을 반영하기 위해 models/item.model.js 파일을 추가해 UUID별 획득 아이템을 서버에서 저장했습니다.

```jsx
//item.model.js
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
```

서버에 스테이지 이동 이벤트를 발생 시킨 클라이언트 점수와
스테이지 체류 시간 * 초당 점수획득 + 얻은 아이템 점수의 총합을 비교해 다음 스테이지로 넘어가는 부분을 검증했습니다.

```jsx
const onlyTimeScore = elapsedTime * currentStageTable.scorePerSecond;
```

오직 시간으로만 얻은 점수의 총합을 계산하고

```jsx
const earnItemArray = getItems(userId);
  let itemScore = 0;
  earnItemArray.forEach((index) => {
    itemScore += index.score;
  });
```

UUID 별 아이템 배열에서 모든 아이템의 점수를 더해 아이템으로만 얻은 점수를 계산했습니다

```jsx
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
```

tolerance  변수는 스테이지 단계에 따른 유동적인 오차점수를  부여해주는 값이 담겨 있습니다.

기존 코드는 서버 지연시간을 반영한 +-5 의 오차시간을 부여했지만, 스테이지가 높아지고 초당 점수,아이템의 점수가 증가함에 따라 오차범위를 초과하는 경우가 발생했습니다.

```jsx
const tolerance = (currentStageTable.id - 1000) * 12;
//스테이지 * 12 정도가 적절한 오차값, 아이템 점수의 증가량과 초당 점수 증가량을 고려한 수치
```

### 각 스테이지별 오차 점수와 허용되는 서버 지연 시간
$$
허용 서버 지연 시간 (초) = \left(\frac{(\text{초당 점수} \times 12) - (\text{초당 점수} + \text{최대 아이템 점수})}{\text{초당 점수}}\right)
$$


| 스테이지 | 스테이지 ID | 초당 점수 | 아이템 해금  | 최대 아이템 점수 | 오차 점수 (tolerance) | 허용 서버 지연 시간 (초)                                       |
|----------|-------------|-----------|--------------|------------------|-----------------------|-------------------------------------------------------------|
| 1        | 1000        | 1         | [1]          | 10               | 12*1=12               |$$\(\left(\frac{12 - 11}{1}\right) = 1.0\)$$                 |
| 2        | 1001        | 2         | [1, 2]       | 20               | 12*2=24               |$$\(\left(\frac{24 - 22}{2}\right) = 1.0\)$$                 |
| 3        | 1002        | 3         | [1, 2, 3]    | 30               | 12*3=36               |$$\(\left(\frac{36 - 33}{3}\right) = 1.0\)$$                 |
| 4        | 1003        | 4         | [2, 3, 4]    | 40               | 12*4=48               |$$\(\left(\frac{48 - 44}{4}\right) = 1.0\)$$                 |
| 5        | 1004        | 5         | [3, 4, 5]    | 50               | 12*5=60               |$$\(\left(\frac{60 - 55}{5}\right) = 1.0\)$$                 |
| 6        | 1005        | 6         | [4, 5, 6]    | 60               | 12*6=72               |$$\(\left(\frac{72 - 66}{6}\right) = 1.0\)$$                 |
| 7        | 1006        | 7         | [6]          | 60               | 12*7=84               |$$\(\left(\frac{84 - 67}{7}\right) \approx 2.4\)$$           |



### 도전과제 - broadcast

이번 과제에는 handlerMappings를 이용해 정해진 패킷구조대로 데이터를 주고받는 식으로 코드가 구현되어 있습니다.
하지만 코드의 구조를 좀 더 자세히 이해하고 패킷 구조와 매핑의 편리함을 잘 이해할 수 있도록 날것의 코드로 구현해봤습니다.

최고점수 반영

1. 서버에서 인메모리 방식으로 최고점수를 저장한다
2. 클라이언트가 시작되면 서버의 최고점수를 바탕으로 프론트엔드의 최고점수를 표시한다
3. 클라이언트가 새로운 최고점수를 갱신하면 서버로 최고점수를 전송한다.서버는 최고 점수가 맞는지 간단하게 확인 후 ,모든 클라이언트의 소켓으로 데이터를 전달해 프론트엔드에 최고점수를 실시간으로 반영한다.

인메모리에 최고점수를 저장하기 위해 highScore.model.js 파일을 생성했습니다

```jsx
//유저의 최고점수를 관리하는 파일
const highScore = {score:10}; //임시로 초기값 10 부여

export const setScore = (score)=>{
    if(score>highScore.score){
        highScore.score = score;
    }
}

export const getScore = () =>{
    return highScore.score;
}
```

초기 연결시 서버 메모리의 최고 점수를 클라이언트에게 전송

```jsx
export const handleConnection = (socket, userUUID) => {
  console.log(`New user connected: ${userUUID} with socket ID ${socket.id}`);
  console.log('Current users:', getUsers());
  createStage(userUUID);

  socket.emit('connection', { uuid: userUUID , highScore:getScore()});
};
```

클라이언트 측에서도 받은 점수를 프론트엔드에 반영

```jsx
socket.on('connection', (data) => {
  console.log('connection: ', data);
  userId = data.uuid;
  const score = getScoreInstance();
  score.updateHighScore(data.highScore);
});
```

클라이언트가 새로운 최고점수를 달성 했을 시 , 서버로 해당 정보를 전송

```jsx
 setHighScore() {
    const highScore = Number(localStorage.getItem(this.HIGH_SCORE_KEY));
    if (this.score > highScore) {
      localStorage.setItem(this.HIGH_SCORE_KEY, Math.floor(this.score));
      sendHighScore(Math.floor(this.score))//신기록 달성시, 점수정보를 전달
    }
```

서버에서 해당 이벤트를 받아오는 코드입니다

```jsx
const registerHandler = (io) => {
  io.on('connection', (socket) => {
  
  //기존 코드 생략
  
  
    // 신기록 달성시 이벤트 처리
    socket.on('newHighScore', (data) => handleHighScore(io,data));
  });
};
```

서버는 최고 점수를 확인후 모든 클라이언트에게 점수를 보냅니다

```
export const handleHighScore = (io,data) =>{
    if (data.score > getScore()) {
        setScore(data.score);
        io.emit('highScore', { highScore:data.score });
    }
}
```

클라이언트는 이 이벤트를 처리하여 프론트엔드에 실시간으로 반영합니다

```jsx
socket.on('highScore',(data=>{
  console.log("서버로 부터 새로운 최고기록 받음");
  const score = getScoreInstance();
  score.updateHighScore(data.highScore);
}))

```

Score 인스턴스를 불러와 highScore 값을 변경합니다.
    
