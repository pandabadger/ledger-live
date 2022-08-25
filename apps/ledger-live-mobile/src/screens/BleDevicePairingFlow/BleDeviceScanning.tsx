// THIS IS NEW PAIRING FLOW
import React, { useCallback, useEffect, useState } from "react";
import { FlatList } from "react-native";
import { StackScreenProps } from "@react-navigation/stack";
import { Flex, InfiniteLoader, Text, Button } from "@ledgerhq/native-ui";
import {
  ArrowLeftMedium,
  BluetoothMedium,
} from "@ledgerhq/native-ui/assets/icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { BleErrorCode } from "react-native-ble-plx";
import { useBleDevicesScanning } from "@ledgerhq/live-common/ble/hooks/useBleDevicesScanning";
import { ScannedDevice } from "@ledgerhq/live-common/ble/types";
import { getDeviceModel } from "@ledgerhq/devices";
import { useTranslation } from "react-i18next";

import { SyncOnboardingStackParamList } from "../../components/RootNavigator/SyncOnboardingNavigator";
import { ScreenName } from "../../const";
import DeviceItem from "../../components/SelectDevice/DeviceItem";
import TransportBLE from "../../react-native-hw-transport-ble";
import { BLE_SCANNING_NOTHING_TIMEOUT } from "../../constants";
import RequiresBLE from "../../components/RequiresBLE";
import LocationRequired from "../LocationRequired";
import BleDeviceItem from "./BleDeviceItem";
import { DeviceModelId } from "@ledgerhq/types-devices";

const BluetoothThingy = () => (
  <Flex borderRadius="9999px" backgroundColor="#0082FC4D" padding={3}>
    <Flex borderRadius="9999px" backgroundColor="#0082FC4D" padding={4}>
      <Flex borderRadius="9999px" backgroundColor="#0082FC4D" padding={3}>
        <BluetoothMedium size={48} />
      </Flex>
    </Flex>
  </Flex>
);

export type FilterByDeviceModelId = null | DeviceModelId;

export type BleDevicesScanningProps = {
  onDeviceSelect: (item: ScannedDevice, _deviceMeta: any) => void;
  filterByDeviceModelId?: FilterByDeviceModelId;
  areKnownDevicesDisplayed?: boolean;
};

export const BleDevicesScanning = ({
  onDeviceSelect,
  filterByDeviceModelId = null,
  areKnownDevicesDisplayed,
}: BleDevicesScanningProps) => {
  const { t } = useTranslation();
  const productName = filterByDeviceModelId
    ? getDeviceModel(filterByDeviceModelId).productName || filterByDeviceModelId
    : null;

  const [locationDisabledError, setLocationDisabledError] =
    useState<boolean>(false);
  const [locationUnauthorizedError, setLocationUnauthorizedError] =
    useState<boolean>(false);
  const [stopBleScanning, setStopBleScanning] = useState<boolean>(false);

  // If we want to filter on known devices:
  // const knownDeviceIds = useSelector(knownDevicesSelector).map((device) => device.id);

  const { scannedDevices, scanningBleError } = useBleDevicesScanning({
    bleTransportListen: TransportBLE.listen,
    stopBleScanning,
    filterByModelIds: filterByDeviceModelId
      ? [filterByDeviceModelId]
      : undefined,
  });

  // Handles scanning error
  useEffect(() => {
    if (scanningBleError) {
      // Currently using the error code values from react-native-ble-plx
      // It should be defined indenpendently, in live-common
      if (
        scanningBleError?.errorCode === BleErrorCode.LocationServicesDisabled
      ) {
        setStopBleScanning(true);
        setLocationDisabledError(true);
      }

      if (scanningBleError?.errorCode === BleErrorCode.BluetoothUnauthorized) {
        setStopBleScanning(true);
        setLocationUnauthorizedError(true);
      }
    }
  }, [scanningBleError]);

  const renderItem = useCallback(
    ({ item }: { item: ScannedDevice }) => {
      const deviceMeta = {
        deviceId: item.deviceId,
        deviceName: `${item.deviceName}`,
        wired: false,
        modelId: item.deviceModel.id,
      };

      return (
        <BleDeviceItem
          deviceMeta={deviceMeta}
          onSelect={() => onDeviceSelect(item, deviceMeta)}
        />
      );
    },
    [onDeviceSelect],
  );

  const onLocationFixed = useCallback(() => {
    setLocationDisabledError(false);
    setLocationUnauthorizedError(false);
    setStopBleScanning(false);
  }, [setLocationDisabledError, setLocationUnauthorizedError]);

  if (locationDisabledError) {
    return <LocationRequired onRetry={onLocationFixed} errorType="disabled" />;
  }

  if (locationUnauthorizedError) {
    return (
      <LocationRequired onRetry={onLocationFixed} errorType="unauthorized" />
    );
  }

  return (
    <Flex bg="background.main" height="100%">
      <Flex px={4}>
        <Flex mb={8} alignItems="center">
          <BluetoothThingy />
        </Flex>
        <Text mb={3} textAlign="center" variant="h4" fontWeight="semiBold">
          {productName
            ? t("blePairingFlow.scanning.withProductName.title", {
                productName,
              })
            : t("blePairingFlow.scanning.withoutProductName.title")}
        </Text>
        <Text
          mb={8}
          color="neutral.c70"
          textAlign="center"
          variant="body"
          fontWeight="medium"
        >
          {productName
            ? t("blePairingFlow.scanning.withProductName.description", {
                productName,
              })
            : t("blePairingFlow.scanning.withoutProductName.description")}
        </Text>
        <FlatList
          data={scannedDevices}
          renderItem={renderItem}
          keyExtractor={item => `${item.deviceId}-${Math.random()}`}
          ListEmptyComponent={<InfiniteLoader size={58} />}
        />
      </Flex>
    </Flex>
  );
};
