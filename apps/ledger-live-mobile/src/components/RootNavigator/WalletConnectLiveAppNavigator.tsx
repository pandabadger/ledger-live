import React, { useMemo } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { useTheme } from "styled-components/native";

import useFeature from "@ledgerhq/live-common/featureFlags/useFeature";
import { Flex, Icons } from "@ledgerhq/native-ui";
import { ScreenName } from "../../const";
import { getStackNavigatorConfig } from "../../navigation/navigatorConfig";
import styles from "../../navigation/styles";

import PlatformApp from "../../screens/Platform/App";

const options = {
  headerBackImage: () => (
    <Flex pl="16px">
      <Icons.CloseMedium color="neutral.c100" size="20px" />
    </Flex>
  ),
  headerStyle: styles.headerNoShadow,
  headerTitle: () => null,
};

export default function WalletConnectLiveAppNavigator({ route }: any) {
  const { colors } = useTheme();
  const walletConnectLiveApp = useFeature("walletConnectLiveApp");
  const stackNavigationConfig = useMemo(
    () => getStackNavigatorConfig(colors, true),
    [colors],
  );

  const { params: routeParams } = route;

  const platform = walletConnectLiveApp?.params?.liveAppId || "wallet-connect";

  return (
    <Stack.Navigator screenOptions={stackNavigationConfig}>
      <Stack.Screen name={ScreenName.WalletConnectScan} options={options}>
        {(_props: any) => (
          <PlatformApp
            {..._props}
            {...routeParams}
            route={{
              ..._props.route,
              params: {
                platform,
                scan: true,
                account: _props.route.params?.accountId,
                uri: _props.route.params?.uri,
              },
            }}
          />
        )}
      </Stack.Screen>
      <Stack.Screen
        name={ScreenName.WalletConnectDeeplinkingSelectAccount}
        options={options}
      >
        {(_props: any) => (
          <PlatformApp
            {..._props}
            {...routeParams}
            route={{
              ..._props.route,
              params: {
                platform,
                uri: _props.route.params?.uri,
                account: _props.route.params?.accountId,
              },
            }}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name={ScreenName.WalletConnectConnect} options={options}>
        {(_props: any) => (
          <PlatformApp
            {..._props}
            {...routeParams}
            route={{
              ..._props.route,
              params: {
                platform,
                uri: _props.route.params?.uri,
                account: _props.route.params?.accountId,
              },
            }}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

const Stack = createStackNavigator();
