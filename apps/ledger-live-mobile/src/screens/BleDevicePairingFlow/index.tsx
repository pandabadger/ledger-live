import React, { useCallback, useEffect, useState } from "react";
import { ScannedDevice } from "@ledgerhq/live-common/ble/types";
import { DeviceModelId } from "@ledgerhq/types-devices";
import { Device } from "@ledgerhq/live-common/hw/actions/types";
import { StackScreenProps } from "@react-navigation/stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { Flex } from "@ledgerhq/native-ui";

import { BaseNavigatorStackParamList } from "../../components/RootNavigator/BaseNavigator";
import RequiresBLE from "../../components/RequiresBLE";
import { BleDevicesScanning } from "./BleDeviceScanning";
import { BleDevicePairing } from "./BleDevicePairing";

const TIMEOUT_AFTER_PAIRED_MS = 2000;

export type BleDevicePairingFlowParams = {
  filterByDeviceModelId?: DeviceModelId;
  areKnownDevicesDisplayed?: boolean;
  navigateToConfig: {
    navigateToDeviceIdParamName?: string;
    navigateToScreenName: string;
    navigateToNavigatorName: string;
    navigateToParams: object | undefined; // Record<string, unknown>;
  };
};

type BleDevicePairingFlowProps = StackScreenProps<
  BaseNavigatorStackParamList,
  "BleDevicePairingFlow"
>;

export const BleDevicePairingFlow = ({
  navigation,
  route,
}: BleDevicePairingFlowProps) => {
  const {
    filterByDeviceModelId,
    navigateToConfig: {
      navigateToNavigatorName,
      navigateToScreenName,
      navigateToParams,
      navigateToDeviceIdParamName,
    },
  } = route.params;
  const [deviceToPair, setDeviceToPair] = useState<Device | null>(null);

  const { routes, index, history, key } = navigation.getState();
  console.log(
    `🦄 BleDevicePairingFlow: routes = ${JSON.stringify(
      routes,
    )}, index = ${index}, history = ${JSON.stringify(
      history,
    )}, key = ${JSON.stringify(key)}`,
  );

  console.log(`🫵 BleDevicePairingFlow: navigation state = ${JSON.stringify(navigation.getState())}`);

  const onDeviceSelect = useCallback((item: ScannedDevice) => {
    const deviceToPair = {
      deviceId: item.deviceId,
      deviceName: item.deviceName,
      modelId: item.deviceModel.id,
      wired: false,
    };

    setDeviceToPair(deviceToPair);
  }, []);

  const onPaired = useCallback((device: Device) => {
    setTimeout(() => {
      navigation.navigate(navigateToNavigatorName, {
        screen: navigateToScreenName,
        params: {
          ...navigateToParams,
          [navigateToDeviceIdParamName ?? "pairedDevice"]: device,
        },
      });
    }, TIMEOUT_AFTER_PAIRED_MS);
  }, []);

  const onRetryPairingFlow = useCallback(() => {
    setDeviceToPair(null);
  }, []);

  return (
    <RequiresBLE>
      <SafeAreaView>
        <Flex bg="background.main" height="100%">
          {deviceToPair ? (
            <BleDevicePairing
              deviceToPair={deviceToPair}
              onPaired={onPaired}
              onRetry={onRetryPairingFlow}
            />
          ) : (
            <BleDevicesScanning
              filterByDeviceModelId={filterByDeviceModelId}
              onDeviceSelect={onDeviceSelect}
            />
          )}
        </Flex>
      </SafeAreaView>
    </RequiresBLE>
  );
};
