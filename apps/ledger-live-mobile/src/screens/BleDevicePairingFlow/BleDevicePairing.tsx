// THIS IS NEW PAIRING FLOW
import React, { useCallback, useEffect } from "react";
import { NativeModules } from "react-native";
import { useTheme } from "styled-components/native";
import { StackScreenProps } from "@react-navigation/stack";
import {
  useBleDevicePairing,
  PairingError,
} from "@ledgerhq/live-common/ble/hooks/useBleDevicePairing";
import { Device } from "@ledgerhq/live-common/hw/actions/types";
import { useTranslation } from "react-i18next";
import { getDeviceModel } from "@ledgerhq/devices";
import { Flex, InfiniteLoader, Text, Button } from "@ledgerhq/native-ui";
import {
  CloseMedium,
  CircledCheckSolidMedium,
  CircledCrossSolidMedium,
  InfoMedium,
} from "@ledgerhq/native-ui/assets/icons";
import Animation from "../../components/Animation";
import { getDeviceAnimation } from "../../helpers/getDeviceAnimation";

export type BleDevicePairingProps = {
  onPaired: (device: Device) => void;
  onRetry: () => void;
  deviceToPair: Device;
};

export const BleDevicePairing = ({
  deviceToPair,
  onPaired,
  onRetry,
}: BleDevicePairingProps) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const theme = colors.type as "dark" | "light";

  const productName =
    getDeviceModel(deviceToPair.modelId).productName || deviceToPair.modelId;
  const deviceName = deviceToPair.deviceName || productName;


  const { isPaired, pairingError } = useBleDevicePairing({
    deviceId: deviceToPair.deviceId,
  });

  useEffect(() => {
    if (isPaired) {
      onPaired(deviceToPair);
    }
  }, [isPaired, deviceToPair, onPaired]);

  if (isPaired) {
    return (
        <Flex bg="background.main" height="100%">
          <Flex mt={10}>
            <Flex alignItems="center">
              <Flex
                alignItems="center"
                justifyContent="center"
                p={1}
                borderWidth={2}
                borderRadius="9999px"
                borderColor={colors.success.c80}
                mb={6}
              >
                <CircledCheckSolidMedium color={colors.success.c80} size={48} />
              </Flex>
              <Text
                mb={8}
                textAlign="center"
                variant="h4"
                fontWeight="semiBold"
              >
                {t("blePairingFlow.pairing.success.title", {
                  deviceName,
                })}
              </Text>

              <Animation
                source={getDeviceAnimation({ device: deviceToPair, key: "blePaired", theme })}
              />
            </Flex>
          </Flex>
        </Flex>
    );
  }
  if (pairingError) {
    return (
        <Flex bg="background.main" height="100%" justifyContent="space-between">
          <Flex mx={10}>
            <Flex alignItems="center" justifyContent="center" p={5}>
              <CircledCrossSolidMedium color={colors.error.c80} size={56} />
            </Flex>
            <Text mb={8} textAlign="center" variant="h4" fontWeight="semiBold">
              {t("blePairingFlow.pairing.error.title")}
            </Text>
            <Text textAlign="center">
              {t("blePairingFlow.pairing.error.subtitle", { productName })}
            </Text>
          </Flex>
          <Flex px={4} mb={10}>
            <Button type="main" onPress={onRetry}>
              {t("blePairingFlow.desyncDrawer.retryCta")}
            </Button>
          </Flex>
        </Flex>
    );
  }

  return (
      <Flex bg="background.main" height="100%">
        <Flex mt={10}>
          <Flex alignItems="center">
            <Flex mb={6} p={1} borderWidth={2} borderColor="transparent">
              <InfiniteLoader size={48} />
            </Flex>
            <Text variant="h4" fontWeight="semiBold" textAlign="center" mb={4}>
              {t("blePairingFlow.pairing.loading.title", { deviceName })}
            </Text>
            <Text
              variant="body"
              fontWeight="medium"
              textAlign="center"
              mb={8}
              color="neutral.c80"
            >
              {t("blePairingFlow.pairing.loading.subtitle", { productName })}
            </Text>
            <Animation
              source={getDeviceAnimation({ device: deviceToPair, key: "blePairing", theme })}
            />
          </Flex>
        </Flex>
      </Flex>
  );
};
