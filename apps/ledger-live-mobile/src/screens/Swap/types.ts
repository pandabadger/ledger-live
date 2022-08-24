import {
  ExchangeRate,
  MappedSwapOperation,
  SwapDataType,
  Pair,
} from "@ledgerhq/live-common/exchange/swap/types";
<<<<<<< HEAD
=======
import { AccountLike, Operation } from "@ledgerhq/types-live";
>>>>>>> db4df5bda62a62a56aa13e956040a614f0554508
import { CryptoCurrency, TokenCurrency } from "@ledgerhq/types-cryptoassets";
import { Transaction } from "@ledgerhq/live-common/generated/types";
import { MaterialTopTabScreenProps } from "@react-navigation/material-top-tabs";
import { StackScreenProps } from "@react-navigation/stack";
<<<<<<< HEAD
=======
import { LodashToPairs } from "lodash/fp";
>>>>>>> db4df5bda62a62a56aa13e956040a614f0554508

export type SwapFormProps = MaterialTopTabScreenProps<
  SwapFormNavParamList,
  "SwapForm"
>;

export type SelectAccountProps = StackScreenProps<
  SwapNavParamList,
  "SelectAccount"
>;

export type SelectCurrencyProps = StackScreenProps<
  SwapNavParamList,
  "SelectCurrency"
>;

export type SelectProviderProps = StackScreenProps<
  SwapNavParamList,
  "SelectProvider"
>;

export type SelectFeesProps = StackScreenProps<SwapNavParamList, "SelectFees">;

export type LoginProps = StackScreenProps<SwapNavParamList, "Login">;

export type KYCProps = StackScreenProps<SwapNavParamList, "KYC">;

export type MFAProps = StackScreenProps<SwapNavParamList, "MFA">;

export type PendingOperationProps = StackScreenProps<
  SwapNavParamList,
  "PendingOperation"
>;

export type OperationDetailsProps = StackScreenProps<
  SwapNavParamList,
  "OperationDetails"
>;

type Target = "from" | "to";

export type SwapNavParamList = {
  Swap: undefined;
  SelectAccount: {
    target: Target;
    provider: string;
    swap: SwapDataType;
    selectableCurrencyIds: string[];
    selectedCurrency: CryptoCurrency | TokenCurrency;
  };
  SelectCurrency: {
    currencies: string[];
    provider: string;
  };
  SelectProvider: {
    provider: string;
    swap: SwapDataType;
    selectedId: string;
  };
  SelectFees: {
    swap: SwapDataType;
    rate: ExchangeRate;
    provider: string;
    transaction: Transaction;
  };
  Login: {
    provider: string;
  };
  KYC: {
    provider: string;
  };
  MFA: {
    provider: string;
  };
  PendingOperation: {
    swapOperation: SwapOperation;
  };
  OperationDetails: {
    swapOperation: SwapOperation;
  };
};

type SwapOperation = Omit<MappedSwapOperation, "fromAccount" | "toAccount"> & {
  fromAccountId: string;
  toAccountId: string;
};

export type SwapFormNavParamList = {
  SwapForm: {
    accountId?: string;
    currency?: CryptoCurrency | TokenCurrency;
    rate?: ExchangeRate;
    transaction?: Transaction;
    target?: Target;
  };
  SwapHistory: undefined;
};