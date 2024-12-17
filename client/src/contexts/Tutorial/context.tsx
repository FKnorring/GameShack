import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
} from 'react';
import {
  Tutorial,
  TutorialContextType,
  TutorialState,
  TutorialStep,
} from '@/models/types/tutorial';
import { useAppContext } from '../App/context';

const initialState: TutorialState = {
  activeTutorial: null,
  activeStep: null,
  queue: [],
  completedTutorials: [],
};

type TutorialAction =
  | { type: 'START_TUTORIAL'; payload: Tutorial }
  | { type: 'SET_ACTIVE_STEP'; payload: TutorialStep }
  | { type: 'COMPLETE_TUTORIAL' }
  | { type: 'SKIP_TUTORIAL' }
  | { type: 'ADD_TO_QUEUE'; payload: Tutorial }
  | { type: 'CLEAR_QUEUE' }
  | { type: 'SYNC_COMPLETED_TUTORIALS'; payload: string[] };

function tutorialReducer(
  state: TutorialState,
  action: TutorialAction
): TutorialState {
  switch (action.type) {
    case 'START_TUTORIAL':
      return {
        ...state,
        activeTutorial: action.payload,
        activeStep: action.payload.steps[0],
        queue: state.queue.filter((t) => t.id !== action.payload.id),
      };
    case 'SET_ACTIVE_STEP':
      return {
        ...state,
        activeStep: action.payload,
      };
    case 'COMPLETE_TUTORIAL':
      return {
        ...state,
        activeTutorial: null,
        activeStep: null,
        completedTutorials: state.activeTutorial
          ? [...state.completedTutorials, state.activeTutorial.id]
          : state.completedTutorials,
      };
    case 'SKIP_TUTORIAL':
      return {
        ...state,
        activeTutorial: null,
        activeStep: null,
      };
    case 'ADD_TO_QUEUE':
      return {
        ...state,
        queue: [...state.queue, action.payload],
      };
    case 'CLEAR_QUEUE':
      return {
        ...state,
        queue: [],
      };
    case 'SYNC_COMPLETED_TUTORIALS':
      return {
        ...state,
        completedTutorials: action.payload,
      };
    default:
      return state;
  }
}

const TutorialContext = createContext<TutorialContextType | undefined>(
  undefined
);

export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(tutorialReducer, initialState);
  const {
    user: { user, updateUser },
  } = useAppContext();

  // Sync completed tutorials from user state
  useEffect(() => {
    if (user?.completedTutorials) {
      dispatch({
        type: 'SYNC_COMPLETED_TUTORIALS',
        payload: user.completedTutorials,
      });
    }
  }, [user?.completedTutorials]);

  const startTutorial = useCallback(
    (tutorial: Tutorial) => {
      if (user?.tutorialsDisabled) return;
      if (user?.completedTutorials?.includes(tutorial.id)) return;
      dispatch({ type: 'START_TUTORIAL', payload: tutorial });
    },
    [user?.tutorialsDisabled, user?.completedTutorials]
  );

  const nextStep = useCallback(() => {
    if (!state.activeTutorial || !state.activeStep) return;

    const currentStepIndex = state.activeTutorial.steps.findIndex(
      (step) => step.id === state.activeStep?.id
    );

    if (currentStepIndex < state.activeTutorial.steps.length - 1) {
      dispatch({
        type: 'SET_ACTIVE_STEP',
        payload: state.activeTutorial.steps[currentStepIndex + 1],
      });
    } else {
      dispatch({ type: 'COMPLETE_TUTORIAL' });
      // Update user's completed tutorials
      if (user && state.activeTutorial) {
        updateUser({
          ...user,
          completedTutorials: [
            ...(user.completedTutorials || []),
            state.activeTutorial.id,
          ],
        });
      }
    }
  }, [state.activeTutorial, state.activeStep, user, updateUser]);

  const completeTutorial = useCallback(() => {
    dispatch({ type: 'COMPLETE_TUTORIAL' });
    // Update user's completed tutorials
    if (user && state.activeTutorial) {
      updateUser({
        ...user,
        completedTutorials: [
          ...(user.completedTutorials || []),
          state.activeTutorial.id,
        ],
      });
    }
  }, [user, state.activeTutorial, updateUser]);

  const skipTutorial = useCallback(() => {
    dispatch({ type: 'SKIP_TUTORIAL' });
    completeTutorial();
  }, [completeTutorial]);

  const addToQueue = useCallback(
    (tutorial: Tutorial) => {
      if (user?.tutorialsDisabled) return;
      if (user?.completedTutorials?.includes(tutorial.id)) return;
      dispatch({ type: 'ADD_TO_QUEUE', payload: tutorial });
    },
    [user?.tutorialsDisabled, user?.completedTutorials]
  );

  const clearQueue = useCallback(() => {
    dispatch({ type: 'CLEAR_QUEUE' });
  }, []);

  return (
    <TutorialContext.Provider
      value={{
        state,
        startTutorial,
        nextStep,
        completeTutorial,
        skipTutorial,
        addToQueue,
        clearQueue,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  const context = useContext(TutorialContext);
  if (context === undefined) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
}
