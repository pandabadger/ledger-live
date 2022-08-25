import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
  BottomDrawer,
  Text,
  Button,
  SelectableList,
  Switch,
  Flex,
} from "@ledgerhq/native-ui";
import { DeviceModelId } from "@ledgerhq/types-devices";

import SettingsRow from "../../../components/SettingsRow";
import { NavigatorName, ScreenName } from "../../../const";
import { BaseNavigatorProps } from "../../../components/RootNavigator/BaseNavigator";
import { DebugMockScreenProps } from "./index";
import { FilterByDeviceModelId } from "../../BleDevicePairingFlow/BleDeviceScanning";
import { ScrollView } from "react-native";

const availableDeviceModelFilter = [
  "none",
  DeviceModelId.nanoX,
  DeviceModelId.nanoFTS,
] as const;
type AvailableDeviceModelFilter = typeof availableDeviceModelFilter[number];

export default () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [chosenDeviceModelFilter, setChosenDeviceModelFilter] =
    useState<AvailableDeviceModelFilter>("none");
  const [areKnownDevicesDisplayed, setAreKnownDevicesDisplayed] =
    useState<boolean>(false);
  const navigation = useNavigation<BaseNavigatorProps>();

  // Example using the route to get the current screen name and any params
  // But no current way to get the navigator name (even from the navigation state)
  const { name, params } = useRoute<DebugMockScreenProps["route"]>();
  const { pairedDevice } = params ?? { pairedDevice: null };

  console.log(`🔥 screen name: ${name}, params: ${JSON.stringify(params)}`);

  const goToBlePairingFlow = useCallback(() => {
    setIsDrawerOpen(false);

    navigation.navigate(
      ScreenName.BleDevicePairingFlow as "BleDevicePairingFlow",
      {
        filterByDeviceModelId:
          chosenDeviceModelFilter === "none"
            ? undefined
            : chosenDeviceModelFilter,
        areKnownDevicesDisplayed: areKnownDevicesDisplayed,
        navigateToConfig: {
          navigateToScreenName: name,
          navigateToNavigatorName: NavigatorName.Settings,
          navigateToParams: params,
        },
      },
    );
  }, [navigation, chosenDeviceModelFilter, areKnownDevicesDisplayed]);

  const onPress = useCallback(() => {
    setIsDrawerOpen(true);
  }, []);

  const onCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const onChangeDeviceModelFilter = useCallback(
    (value: AvailableDeviceModelFilter) => {
      setChosenDeviceModelFilter(value);
    },
    [],
  );

  const onChangeDisplayKnownDevices = useCallback((value: boolean) => {
    setAreKnownDevicesDisplayed(value);
  }, []);

  return (
    <SettingsRow
      title="Debug BLE pairing flow"
      onPress={onPress}
      desc={`Paired device: ${
        pairedDevice?.deviceName ?? pairedDevice?.deviceId ?? "no device"
      }`}
    >
      <BottomDrawer isOpen={isDrawerOpen} onClose={onCloseDrawer}>
        <Flex mb="8">
          <Text variant="body" mb="8">
            Choose which device model to filter on:
          </Text>

          <SelectableList
            currentValue={chosenDeviceModelFilter}
            onChange={onChangeDeviceModelFilter}
          >
            {availableDeviceModelFilter.map((value, index) => (
              <SelectableList.Element key={value + index} value={value}>
                {value}
              </SelectableList.Element>
            ))}
          </SelectableList>
        </Flex>
        <Flex mb="8">
          <Switch
            label="Display known device ?"
            onChange={onChangeDisplayKnownDevices}
            checked={areKnownDevicesDisplayed}
          />
        </Flex>
        <Button type="color" onPress={goToBlePairingFlow}>
          Go to pairing flow
        </Button>
      </BottomDrawer>
    </SettingsRow>
  );
};
