import { createStore } from "zustand/vanilla";
import { createPetState, petReducer, type PetAction } from "./pet";

/** 페이지별 일시 상태. 실제 인정된 돌봄만 영구 기록에 한 번 전달합니다. */
export function createPetCareStore(onPat: () => void, onSnack: () => void) {
  const store = createStore(() => ({
    state: createPetState(),
    dispatch(action: PetAction) {
      const previous = store.getState().state;
      const next = petReducer(previous, action);
      store.setState({ state: next });
      if (next.pats > previous.pats) onPat();
      if (next.snacks > previous.snacks) onSnack();
    },
  }));
  return store;
}
