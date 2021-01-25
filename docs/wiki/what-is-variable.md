## 변수란?

프로그래밍은 수학에서 파생된 학문입니다.  
수학에서도 우리는 변수를 수도 없이 많이 써왔습니다.

> `x`가 `1`일 때, `y`는 `x + 1`이다. 이 때, `y`의 값은?

네, 그래요. `y`는 `2`죠.  
이 때 `x`나 `y`를 변수라고 합니다. 쉽죠?

## 자바스크립트, 타입스크립트에서 변수를 사용하는 방법

위 공식을 그대로 프로그래밍 코드로 옮겨볼까요?  
이런 모양새를 가지게 됩니다.

```
const x = 1
const y = x + 1
```

**const**는 새로운 변수를 쓰겠다는 의미에요.  
즉 *const x*는 `x`라는 새로운 변수를 만들어내겠다* 라는 의미죠.

이렇게 만들어 낸 변수는 다음부터는 **const** 없이 사용할 수 있습니다. 이렇게요.

```
const x = 1
const y = x + 1

console.log(y)
```

## 변수끼리도 더하고 뺄 수도 있어요

```
const x = 1
const y = x + 1
const z = x + y

const a = x / y
const b = y * z
```

이 경우, 변수 `z`는 `3`이 됩니다.  
변수 `a`는 `0.5`가 되구요. 변수 `b`는 `6`이 되겠네요.