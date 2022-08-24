import React, { memo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigation, useTheme } from "@react-navigation/native";
import { NFTMetadata } from "@ledgerhq/types-live";
import { View, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { useFeature } from "@ledgerhq/live-common/featureFlags/index";
import { Icons } from "@ledgerhq/native-ui";
import { NavigatorName, ScreenName } from "../../const";
import ExternalLinkIcon from "../../icons/ExternalLink";
import OpenSeaIcon from "../../icons/OpenSea";
import RaribleIcon from "../../icons/Rarible";
import GlobeIcon from "../../icons/Globe";
import BottomModal from "../BottomModal";
import { rgba } from "../../colors";
import LText from "../LText";

type Props = {
  links: NFTMetadata["links"] | null;
  isOpen: boolean;
  onClose: () => void;
  metadata?: NFTMetadata;
};

const NftLink = ({
  style,
  leftIcon,
  rightIcon,
  title,
  subtitle,
  onPress,
}: {
  style?: any;
  leftIcon: React$Node;
  rightIcon?: React$Node;
  title: string;
  subtitle?: string;
  onPress?: () => any;
}) => (
  <TouchableOpacity style={[styles.section, style]} onPress={onPress}>
    <View style={styles.sectionBody}>
      <View style={styles.icon}>{leftIcon}</View>
      <View>
        <LText semiBold style={styles.sectionTitle}>
          {title}
        </LText>
        {subtitle && <LText style={styles.sectionSubTitle}>{subtitle}</LText>}
      </View>
    </View>
    {rightIcon}
  </TouchableOpacity>
);

const NftLinksPanel = ({ links, isOpen, onClose, metadata }: Props) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const customImage = useFeature("customImage");

  const { uri } = metadata?.medias?.big || {};

  const handlePressCustomImage = useCallback(() => {
    if (!uri) return;
    navigation.navigate(NavigatorName.CustomImage, {
      screen: ScreenName.CustomImageStep1Crop,
      params: {
        imageUrl: uri,
      },
    });
    onClose && onClose();
  }, [navigation, onClose, uri]);

  const showCustomImageButton = customImage?.enabled && !!uri;

  return (
    <BottomModal
      style={[
        styles.root,
        {
          backgroundColor: colors.card,
        },
      ]}
      id="NftLinksModal"
      isOpened={isOpen}
      onClose={onClose}
    >
      {!links?.opensea ? null : (
        <NftLink
          style={styles.sectionMargin}
          leftIcon={<OpenSeaIcon size={36} />}
          title={`${t("nft.viewerModal.viewOn")} OpenSea`}
          rightIcon={<ExternalLinkIcon size={20} color={colors.grey} />}
          onPress={() => Linking.openURL(links.opensea)}
        />
      )}

      {!links?.rarible ? null : (
        <NftLink
          style={styles.sectionMargin}
          leftIcon={<RaribleIcon size={36} />}
          title={`${t("nft.viewerModal.viewOn")} Rarible`}
          rightIcon={<ExternalLinkIcon size={20} color={colors.grey} />}
          onPress={() => Linking.openURL(links.rarible)}
        />
      )}

      {showCustomImageButton ? (
        <NftLink
          title={"Custom image"}
          style={styles.sectionMargin}
          leftIcon={
            <View
              style={[
                styles.roundIconContainer,
                { backgroundColor: rgba(colors.live, 0.1) },
              ]}
            >
              <Icons.BracketsMedium size={16} color={colors.live} />
            </View>
          }
          onPress={handlePressCustomImage}
        />
      ) : null}

      {!links?.explorer ? null : (
        <>
          <View style={styles.hr} />

          <NftLink
            leftIcon={
              <View
                style={[
                  styles.roundIconContainer,
                  { backgroundColor: rgba(colors.live, 0.1) },
                ]}
              >
                <GlobeIcon size={16} color={colors.live} />
              </View>
            }
            title={t("nft.viewerModal.viewInExplorer")}
            rightIcon={<ExternalLinkIcon size={20} color={colors.grey} />}
            onPress={() => Linking.openURL(links.explorer)}
          />
        </>
      )}
    </BottomModal>
  );
};

const styles = StyleSheet.create({
  root: {
    position: "relative",
    paddingHorizontal: 16,
    paddingTop: 64,
    paddingBottom: 60,
  },
  section: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionBody: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 16,
  },
  sectionSubTitle: {
    fontSize: 13,
  },
  sectionMargin: {
    marginBottom: 30,
  },
  icon: {
    marginRight: 16,
  },
  roundIconContainer: {
    height: 36,
    width: 36,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexShrink: 0,
  },
  hr: {
    borderBottomWidth: 1,
    borderBottomColor: "#DFDFDF",
    marginBottom: 24,
  },
});

export default memo(NftLinksPanel);
