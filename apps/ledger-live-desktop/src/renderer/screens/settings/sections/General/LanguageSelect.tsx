import React, { useMemo, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import {
  allLanguages,
  prodStableLanguages,
  Locale,
  localeIdToDeviceLanguage,
} from "~/config/languages";
import useEnv from "~/renderer/hooks/useEnv";
import { setLanguage } from "~/renderer/actions/settings";
import { useSystemLanguageSelector, languageSelector } from "~/renderer/reducers/settings";
import { lastSeenDeviceSelector } from "~/renderer/reducers/settings";
import Select from "~/renderer/components/Select";
import Track from "~/renderer/analytics/Track";
import { useAvailableLanguagesForDevice } from "@ledgerhq/live-common/manager/hooks";
import { idsToLanguage } from "@ledgerhq/types-live";
import ChangeDeviceLanguagePrompt from "./ChangeDeviceLanguagePrompt";

export const languageLabels: { [key in Locale]: string } = {
  de: "Deutsch",
  el: "Ελληνικά",
  en: "English",
  es: "Español",
  fi: "suomi",
  fr: "Français",
  hu: "magyar",
  it: "italiano",
  ja: "日本語",
  ko: "한국어",
  nl: "Nederlands",
  no: "Norsk",
  pl: "polski",
  pt: "português",
  ru: "Русский",
  sr: "српски",
  sv: "svenska",
  tr: "Türkçe",
  zh: "简体中文",
};

type ChangeLangArgs = { value: Locale; label: string };

const LanguageSelect = () => {
  const useSystem = useSelector(useSystemLanguageSelector);
  const language = useSelector(languageSelector);
  const lastSeenDevice = useSelector(lastSeenDeviceSelector);
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();

  const [isDeviceLanguagePromptOpen, setIsDeviceLanguagePromptOpen] = useState<boolean>(false);

  const deviceLocalizationFeatureFlag = { enabled: true }; // useFeature("deviceLocalization");
  // TODO: reactivate this feature flag once QA is done

  const availableDeviceLanguages = useAvailableLanguagesForDevice(lastSeenDevice?.deviceInfo);

  const debugLanguage = useEnv("EXPERIMENTAL_LANGUAGES");

  const languages = useMemo(
    () =>
      [{ value: null as Locale | null, label: t(`language.system`) }].concat(
        (debugLanguage ? allLanguages : prodStableLanguages).map(key => ({
          value: key,
          label: languageLabels[key],
        })),
      ),
    [t, debugLanguage],
  );

  const currentLanguage = useMemo(
    () => (useSystem ? languages[0] : languages.find(l => l.value === language)),
    [language, languages, useSystem],
  ) as {
    value: Locale | null;
    label: string;
  };

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [i18n, language]);

  const handleChangeLanguage = useCallback(
    ({ value: languageKey }: ChangeLangArgs) => {
      const deviceLanguageId = lastSeenDevice?.deviceInfo.languageId;
      const potentialDeviceLanguage = localeIdToDeviceLanguage[languageKey];
      const langAvailableOnDevice =
        potentialDeviceLanguage !== undefined &&
        availableDeviceLanguages.includes(potentialDeviceLanguage);

      // firmware version verification is not really needed here, the presence of a language id
      // indicates that we are in a firmware that supports localization
      if (
        langAvailableOnDevice &&
        deviceLanguageId !== undefined &&
        idsToLanguage[deviceLanguageId] !== potentialDeviceLanguage &&
        deviceLocalizationFeatureFlag.enabled
      ) {
        setIsDeviceLanguagePromptOpen(true);
      }

      dispatch(setLanguage(languageKey));
    },
    [dispatch, lastSeenDevice, availableDeviceLanguages, deviceLocalizationFeatureFlag],
  );

  const onClosePrompt = useCallback(() => {
    setIsDeviceLanguagePromptOpen(false);
  }, []);

  return (
    <>
      <Track
        onUpdate
        event="LanguageSelect"
        currentRegion={currentLanguage.value}
      />

      <Select
        small
        minWidth={260}
        isSearchable={false}
        onChange={handleChangeLanguage}
        renderSelected={(item: any) => item && item.name}
        value={currentLanguage}
        options={languages}
      />

      <ChangeDeviceLanguagePrompt
        isOpen={isDeviceLanguagePromptOpen}
        onClose={onClosePrompt}
        currentLanguage={currentLanguage.value as Locale}
      />
    </>
  );
};

export default LanguageSelect;
