import React from "react";
import { ZakiLanguageSelector } from "./ZakiLanguageSelector";

interface LanguageSelectorModalProps {
  onStartChat?: () => void;
}

export const LanguageSelectorModal: React.FC<LanguageSelectorModalProps> = (props) => {
  return <ZakiLanguageSelector {...props} />;
};

export { ZakiLanguageSelector };
