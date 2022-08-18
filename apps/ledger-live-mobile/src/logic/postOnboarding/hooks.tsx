import { useDispatch, useSelector } from "react-redux";
import { useCallback, useMemo } from "react";
import { useNavigation } from "@react-navigation/native";
import { DeviceModelId } from "@ledgerhq/devices/lib/index";
import {
  PostOnboardingActionId,
  PostOnboardingHubState,
} from "@ledgerhq/types-live";
import { useFeatureFlags } from "@ledgerhq/live-common/lib/featureFlags/index";
import { getPostOnboardingAction, getPostOnboardingActionsForDevice } from ".";
import {
  hubStateSelector,
  postOnboardingDeviceModelIdSelector,
  walletPostOnboardingEntryPointDismissedSelector,
} from "../../reducers/postOnboarding";
import {
  clearPostOnboardingLastActionCompleted,
  hidePostOnboardingWalletEntryPoint,
  initPostOnboarding,
  setPostOnboardingActionCompleted,
} from "../../actions/postOnboarding";
import { NavigatorName, ScreenName } from "../../const";

/**
 * @returns an object representing the state that should be rendered on the post
 * onboarding hub screen.
 *
 * This takes feature flagging into account so the logic is
 * resistant to flags getting enabled/disabled over time (for a given disabled
 * feature flag, the actions pointing to it will be excluded).
 * TODO: unit test this
 * */
export function usePostOnboardingHubState(): PostOnboardingHubState {
  const hubState = useSelector(hubStateSelector);
  const { getFeature } = useFeatureFlags();
  return useMemo(() => {
    const actionsState = hubState.actionsToComplete
      .map(actionId => ({
        ...getPostOnboardingAction(actionId),
        completed: !!hubState.actionsCompleted[actionId],
      }))
      .filter(
        actionWithState =>
          !actionWithState.featureFlagId ||
          getFeature(actionWithState.featureFlagId)?.enabled,
      );
    const lastActionCompleted = hubState.lastActionCompleted
      ? getPostOnboardingAction(hubState.lastActionCompleted)
      : null;
    return {
      deviceModelId: hubState.deviceModelId,
      lastActionCompleted,
      actionsState,
    };
  }, [getFeature, hubState]);
}

/**
 *
 * @returns a boolean representing whether all the post onboarding actions have
 * been completed.
 * TODO: unit test this
 */
export function useAllPostOnboardingActionsCompleted(): boolean {
  const { actionsState } = usePostOnboardingHubState();
  return actionsState.every(action => action.completed);
}

/**
 *
 * @returns a boolean representing whether the post onboarding entry point
 * should be visible on the wallet page.
 * TODO: unit test this
 */
export function usePostOnboardingEntryPointVisibleOnWallet(): boolean {
  const dismissed = useSelector(
    walletPostOnboardingEntryPointDismissedSelector,
  );
  const allCompleted = useAllPostOnboardingActionsCompleted();
  return !(dismissed || allCompleted);
}

/**
 *
 * @returns the DeviceModelId of the device of the post onboarding.
 */
export function usePostOnboardingDeviceModelId() {
  return useSelector(postOnboardingDeviceModelIdSelector);
}

/**
 *
 * @returns a function that can be called to navigate to the post
 * onboarding hub.
 */
export function useNavigateToPostOnboardingHubCallback() {
  const navigation = useNavigation();
  return useCallback(() => {
    navigation.navigate(NavigatorName.PostOnboarding, {
      screen: ScreenName.PostOnboardingHub,
    });
  }, [navigation]);
}

/**
 * Use this to initialize AND navigate to the post onboarding hub for a given
 * device model.
 *
 * @param deviceModelId
 * @returns a function that can be called to initialize the post
 * onboarding for the given device model and navigate to the post onboarding
 * hub.
 * TODO: unit test this
 */
export function useStartPostOnboardingCallback(
  deviceModelId: DeviceModelId,
  mock = false,
) {
  const dispatch = useDispatch();
  const navigateToPostOnboardingHub = useNavigateToPostOnboardingHubCallback();
  const actions = useMemo(
    () => getPostOnboardingActionsForDevice(deviceModelId, mock),
    [deviceModelId, mock],
  );
  return useCallback(() => {
    dispatch(
      initPostOnboarding(
        deviceModelId,
        actions.map(action => action.id),
      ),
    );
    if (actions.length === 0) return;
    navigateToPostOnboardingHub();
  }, [actions, deviceModelId, dispatch, navigateToPostOnboardingHub]);
}

/**
 * @returns a function to hide the post onboarding entry point on the wallet
 * screen.
 */
export function useHideWalletEntryPointCallback() {
  const dispatch = useDispatch();
  return useCallback(() => {
    dispatch(hidePostOnboardingWalletEntryPoint());
  }, [dispatch]);
}

/**
 * @returns a function to signal the completion of an action of the post
 * onboarding.
 */
export function useSetActionCompletedCallback() {
  const dispatch = useDispatch();
  return useCallback(
    (actionId: PostOnboardingActionId) =>
      dispatch(setPostOnboardingActionCompleted(actionId)),
    [dispatch],
  );
}

export function useClearLastActionCompletedCallback() {
  const dispatch = useDispatch();
  return useCallback(() => {
    dispatch(clearPostOnboardingLastActionCompleted());
  }, [dispatch]);
}
