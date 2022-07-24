import { Flex, Icons, Text, Button, BoxedIcon } from "@ledgerhq/native-ui";
import React, { useCallback, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Language } from "@ledgerhq/live-common/lib/types/languages";
import BottomModal from "../../../components/BottomModal";
import DeviceLanguageSelection from "./DeviceLanguageSelection";
import DeviceActionModal from "../../../components/DeviceActionModal";
import { createAction } from "@ledgerhq/live-common/lib/hw/actions/installLanguage";
import installLanguage from "@ledgerhq/live-common/lib/hw/installLanguage";
import type { Device } from "@ledgerhq/live-common/lib/hw/actions/types";

type Props = {
  currentLanguage: Language;
  device: Device;
};

const DeviceLanguage: React.FC<Props> = ({ currentLanguage, device }) => {
  const { t } = useTranslation();

  const [isChangeLanguageOpen, setIsChangeLanguageOpen] = useState(false);
  const [deviceForAction, setDeviceForAction] = useState<Device | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(currentLanguage);
  const [deviceLanguage, setDeviceLanguage] = useState<Language>(currentLanguage);


  const action = useMemo(
    () =>
      createAction(() =>
        installLanguage({
          deviceId: device.deviceId,
          language: selectedLanguage,
        }),
      ),
    [selectedLanguage, device.deviceId],
  );

  const closeChangeLanguageModal = useCallback(
    () => setIsChangeLanguageOpen(false),
    [setIsChangeLanguageOpen],
  );
  const openChangeLanguageModal = useCallback(
    () => setIsChangeLanguageOpen(true),
    [setIsChangeLanguageOpen],
  );

  const openDeviceActionModal = useCallback(() => {setDeviceForAction(device); closeChangeLanguageModal()}, [
    setDeviceForAction, device
  ]);
  const closeDeviceActionModal = useCallback(() => setDeviceForAction(null), [
    setDeviceForAction
  ]);

  const refreshDeviceLanguage = useCallback(() => setDeviceLanguage(selectedLanguage), [setDeviceLanguage, selectedLanguage]);

  const successComponent = useCallback(() => (
    <Flex alignItems="center">
      <BoxedIcon Icon={Icons.CheckAloneMedium} iconColor="success.c100" size={48}  iconSize={24} />
      <Text variant="h4" textAlign="center" my={7}>
        {t("deviceLocalization.languageInstalled", { language: t(`deviceLocalization.languages.${selectedLanguage}`) })}
      </Text>
      <Button type="main" alignSelf="stretch" onPress={closeDeviceActionModal}>Continue</Button>
    </Flex>
  ), [closeDeviceActionModal, selectedLanguage, t]);

  return (
    <>
      <Flex
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Flex flexDirection="row">
          <Icons.LanguageMedium size={24} color="neutral.c80" />
          <Text ml={2} color="neutral.c80">
            {t("deviceLocalization.language")}
          </Text>
        </Flex>
        <Button Icon={Icons.DropdownMedium} onPress={openChangeLanguageModal}>
          {t(`deviceLocalization.languages.${deviceLanguage}`)}
        </Button>
      </Flex>
      <BottomModal
        isOpened={isChangeLanguageOpen}
        onClose={closeChangeLanguageModal}
      >
        <DeviceLanguageSelection
          deviceLanguage={deviceLanguage}
          onSelectLanguage={setSelectedLanguage}
          selectedLanguage={selectedLanguage}
          onConfirmInstall={openDeviceActionModal}
        />        
      </BottomModal>
      <DeviceActionModal
          action={action}
          onClose={closeDeviceActionModal}
          device={deviceForAction}
          onResult={refreshDeviceLanguage}
          renderOnResult={successComponent}
        />
    </>
  );
};

export default DeviceLanguage;