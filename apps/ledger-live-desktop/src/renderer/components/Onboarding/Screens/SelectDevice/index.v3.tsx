import React, { useCallback, useContext } from "react";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { DeviceModelId } from "@ledgerhq/devices";
import { Text } from "@ledgerhq/react-ui";
import Button from "~/renderer/components/Button";
import { DeviceSelector } from "./DeviceSelector";
import { track } from "~/renderer/analytics/segment";
import OnboardingNavHeader from "../../OnboardingNavHeader.v3";

import { OnboardingContext } from "../../index.v3";

const SelectDeviceContainer = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const TopRightContainer = styled.div`
  position: absolute;
  right: 40px;
  top: 40px;
`;

const TitleText = styled(Text)`
  position: absolute;
  top: 90px;
  align-self: center;
  color: ${p => p.theme.colors.palette.neutral.c100};
  pointer-events: none;
`;

export function SelectDevice() {
  const { t } = useTranslation();
  const history = useHistory();
  const { setDeviceModelId } = useContext(OnboardingContext);

  const handleDeviceSelect = useCallback(
    (deviceModelId: DeviceModelId) => {
      track("Onboarding Device - Selection", { deviceModelId });
      setDeviceModelId(deviceModelId);
      history.push("/onboarding/select-use-case");
    },
    [history, setDeviceModelId],
  );

  return (
    <SelectDeviceContainer>
      <OnboardingNavHeader onClickPrevious={() => history.push("/onboarding/welcome")} />
      <DeviceSelector onClick={handleDeviceSelect} />
      <TitleText variant="h3" fontSize="28px">
        {t("v3.onboarding.screens.selectDevice.title")}
      </TitleText>
    </SelectDeviceContainer>
  );
}
