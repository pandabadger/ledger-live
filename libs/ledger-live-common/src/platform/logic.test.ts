import {
  broadcastTransactionLogic,
  completeExchangeLogic,
  receiveOnAccountLogic,
  signMessageLogic,
  WebPlatformContext,
} from "./logic";

import { AppManifest } from "./types";
import {
  createFixtureAccount,
  createFixtureCryptoCurrency,
} from "../mock/fixtures/cryptoCurrencies";
import {
  OperationType,
  SignedOperation,
  SignedOperationRaw,
  TokenAccount,
} from "@ledgerhq/types-live";
import BigNumber from "bignumber.js";

import * as converters from "./converters";
import * as serializers from "./serializers";
import * as signMessage from "../hw/signMessage/index";
import { DerivationMode } from "../derivation";
import { TokenCurrency } from "@ledgerhq/types-cryptoassets";
import { RawPlatformTransaction } from "./rawTypes";
import { setSupportedCurrencies } from "../currencies";

describe("receiveOnAccountLogic", () => {
  // Given
  const mockPlatformReceiveRequested = jest.fn();
  const mockPlatformReceiveFail = jest.fn();
  const context = createContextContainingAccountId(
    {
      platformReceiveRequested: mockPlatformReceiveRequested,
      platformReceiveFail: mockPlatformReceiveFail,
    },
    "11",
    "12"
  );
  const uiNavigation = jest.fn();

  beforeEach(() => {
    mockPlatformReceiveRequested.mockClear();
    mockPlatformReceiveFail.mockClear();
    uiNavigation.mockClear();
  });

  describe("when nominal case", () => {
    // Given
    const accountId = "ethereumjs:2:ethereum:0x012:";
    const expectedResult = "Function called";

    beforeEach(() => uiNavigation.mockResolvedValueOnce(expectedResult));

    it("calls uiNavigation callback with an accountAddress", async () => {
      // Given
      const convertedAccount = {
        ...createPlatformAccount(),
        address: "Converted address",
      };
      jest
        .spyOn(converters, "accountToPlatformAccount")
        .mockReturnValueOnce(convertedAccount);

      // When
      const result = await receiveOnAccountLogic(
        context,
        accountId,
        uiNavigation
      );

      // Then
      expect(uiNavigation).toBeCalledTimes(1);
      expect(uiNavigation.mock.calls[0][2]).toEqual("Converted address");
      expect(result).toEqual(expectedResult);
    });

    it("calls the tracking for success", async () => {
      // When
      await receiveOnAccountLogic(context, accountId, uiNavigation);

      // Then
      expect(mockPlatformReceiveRequested).toBeCalledTimes(1);
      expect(mockPlatformReceiveFail).toBeCalledTimes(0);
    });
  });

  describe("when account cannot be found", () => {
    // Given
    const nonFoundAccountId = "ethereumjs:2:ethereum:0x010:";

    it("returns an error", async () => {
      // When
      await expect(async () => {
        await receiveOnAccountLogic(context, nonFoundAccountId, uiNavigation);
      }).rejects.toThrowError("Account required");

      // Then
      expect(uiNavigation).toBeCalledTimes(0);
    });

    it("calls the tracking for error", async () => {
      // When
      await expect(async () => {
        await receiveOnAccountLogic(context, nonFoundAccountId, uiNavigation);
      }).rejects.toThrow();

      // Then
      expect(mockPlatformReceiveRequested).toBeCalledTimes(1);
      expect(mockPlatformReceiveFail).toBeCalledTimes(1);
    });
  });
});

describe("completeExchangeLogic", () => {
  // Given
  const mockPlatformCompleteExchangeRequested = jest.fn();
  const context = createContextContainingAccountId(
    {
      platformCompleteExchangeRequested: mockPlatformCompleteExchangeRequested,
    },
    "11",
    "12"
  );
  const uiNavigation = jest.fn();

  beforeAll(() => {
    setSupportedCurrencies(["bitcoin", "ethereum"]);
  });
  afterAll(() => {
    setSupportedCurrencies([]);
  });

  beforeEach(() => {
    mockPlatformCompleteExchangeRequested.mockClear();
    uiNavigation.mockClear();
  });

  describe("when nominal case", () => {
    // Given
    const expectedResult = "Function called";

    beforeEach(() => uiNavigation.mockResolvedValueOnce(expectedResult));

    it("calls uiNavigation callback with an accountAddress", async () => {
      // Given
      const fromAccount = createFixtureAccount("17");
      context.accounts = [...context.accounts, fromAccount];
      const completeExchangeRequest = {
        provider: "provider",
        fromAccountId: "ethereumjs:2:ethereum:0x017:",
        toAccountId: "ethereumjs:2:ethereum:0x042:",
        transaction: createRawEtherumTransaction(),
        binaryPayload: "binaryPayload",
        signature: "signature",
        feesStrategy: "feeStrategy",
        exchangeType: 8,
      };

      // When
      const result = await completeExchangeLogic(
        context,
        completeExchangeRequest,
        uiNavigation
      );

      // Then
      expect(uiNavigation).toBeCalledTimes(1);
      expect(uiNavigation.mock.calls[0][0]).toEqual({
        provider: "provider",
        exchange: {
          fromAccount,
          fromParentAccount: null,
          toAccount: undefined,
          toParentAccount: null,
        },
        transaction: {
          amount: new BigNumber("1000"),
          data: Buffer.from([]),
          estimatedGasLimit: null,
          family: "ethereum",
          feeCustomUnit: { code: "Gwei", magnitude: 9, name: "Gwei" },
          feesStrategy: "medium",
          gasLimit: new BigNumber("NaN"),
          gasPrice: new BigNumber("NaN"),
          mode: "send",
          networkInfo: null,
          nonce: 8,
          recipient: "0x0123456",
          useAllAmount: false,
          userGasLimit: null,
        },
        binaryPayload: "binaryPayload",
        signature: "signature",
        feesStrategy: "feeStrategy",
        exchangeType: 8,
      });
      expect(result).toEqual(expectedResult);
    });

    it("calls the tracking for success", async () => {
      // Given
      const completeExchangeRequest = {
        provider: "provider",
        fromAccountId: "ethereumjs:2:ethereum:0x012:",
        toAccountId: "ethereumjs:2:ethereum:0x042:",
        transaction: createRawEtherumTransaction(),
        binaryPayload: "binaryPayload",
        signature: "signature",
        feesStrategy: "feeStrategy",
        exchangeType: 8,
      };

      // When
      await completeExchangeLogic(
        context,
        completeExchangeRequest,
        uiNavigation
      );

      // Then
      expect(mockPlatformCompleteExchangeRequested).toBeCalledTimes(1);
    });
  });
});

describe("broadcastTransactionLogic", () => {
  // Given
  const mockplatformBroadcastFail = jest.fn();
  const context = createContextContainingAccountId(
    {
      platformBroadcastFail: mockplatformBroadcastFail,
    },
    "11",
    "12"
  );
  const uiNavigation = jest.fn();

  beforeEach(() => {
    mockplatformBroadcastFail.mockClear();
    uiNavigation.mockClear();
  });

  describe("when nominal case", () => {
    // Given
    const accountId = "ethereumjs:2:ethereum:0x012:";
    const rawSignedTransaction = createSignedOperationRaw();

    it("calls uiNavigation callback with a signedOperation", async () => {
      // Given
      const expectedResult = "Function called";
      const signedOperation = createSignedOperation();
      jest
        .spyOn(serializers, "deserializePlatformSignedTransaction")
        .mockReturnValueOnce(signedOperation);
      uiNavigation.mockResolvedValueOnce(expectedResult);

      // When
      const result = await broadcastTransactionLogic(
        context,
        accountId,
        rawSignedTransaction,
        uiNavigation
      );

      // Then
      expect(uiNavigation).toBeCalledTimes(1);
      expect(uiNavigation.mock.calls[0][2]).toEqual(signedOperation);
      expect(result).toEqual(expectedResult);
    });

    it("calls the tracking for success", async () => {
      // When
      await broadcastTransactionLogic(
        context,
        accountId,
        rawSignedTransaction,
        uiNavigation
      );

      // Then
      expect(mockplatformBroadcastFail).toBeCalledTimes(0);
    });
  });

  describe("when account cannot be found", () => {
    // Given
    const nonFoundAccountId = "ethereumjs:2:ethereum:0x010:";
    const rawSignedTransaction = createSignedOperationRaw();

    it("returns an error", async () => {
      // Given
      const expectedResult = "Function called";
      const signedOperation = createSignedOperation();
      jest
        .spyOn(serializers, "deserializePlatformSignedTransaction")
        .mockReturnValueOnce(signedOperation);
      uiNavigation.mockResolvedValueOnce(expectedResult);

      // When
      await expect(async () => {
        await broadcastTransactionLogic(
          context,
          nonFoundAccountId,
          rawSignedTransaction,
          uiNavigation
        );
      }).rejects.toThrowError("Account required");

      // Then
      expect(uiNavigation).toBeCalledTimes(0);
    });

    it("calls the tracking for error", async () => {
      // When
      await expect(async () => {
        await broadcastTransactionLogic(
          context,
          nonFoundAccountId,
          rawSignedTransaction,
          uiNavigation
        );
      }).rejects.toThrow();

      // Then
      expect(mockplatformBroadcastFail).toBeCalledTimes(1);
    });
  });
});

describe("signMessageLogic", () => {
  // Given
  const mockPlatformSignMessageRequested = jest.fn();
  const mockPlatformSignMessageFail = jest.fn();
  const context = createContextContainingAccountId(
    {
      platformSignMessageRequested: mockPlatformSignMessageRequested,
      platformSignMessageFail: mockPlatformSignMessageFail,
    },
    "11",
    "12"
  );
  const uiNavigation = jest.fn();

  beforeEach(() => {
    mockPlatformSignMessageRequested.mockClear();
    mockPlatformSignMessageFail.mockClear();
    uiNavigation.mockClear();
  });

  describe("when nominal case", () => {
    // Given
    const accountId = "ethereumjs:2:ethereum:0x012:";
    const messageToSign = "Message to sign";
    const spyPrepareMessageToSign = jest.spyOn(
      signMessage,
      "prepareMessageToSign"
    );

    beforeEach(() => spyPrepareMessageToSign.mockClear());

    it("calls uiNavigation callback with a signedOperation", async () => {
      // Given
      const expectedResult = "Function called";
      const formattedMessage = createMessageData();
      spyPrepareMessageToSign.mockReturnValueOnce(formattedMessage);
      uiNavigation.mockResolvedValueOnce(expectedResult);

      // When
      const result = await signMessageLogic(
        context,
        accountId,
        messageToSign,
        uiNavigation
      );

      // Then
      expect(uiNavigation).toBeCalledTimes(1);
      expect(uiNavigation.mock.calls[0][1]).toEqual(formattedMessage);
      expect(result).toEqual(expectedResult);
    });

    it("calls the tracking for success", async () => {
      // When
      await signMessageLogic(context, accountId, messageToSign, uiNavigation);

      // Then
      expect(mockPlatformSignMessageRequested).toBeCalledTimes(1);
      expect(mockPlatformSignMessageFail).toBeCalledTimes(0);
    });
  });

  describe("when account cannot be found", () => {
    // Given
    const nonFoundAccountId = "ethereumjs:2:ethereum:0x010:";
    const messageToSign = "Message to sign";

    it("returns an error", async () => {
      // When
      await expect(async () => {
        await signMessageLogic(
          context,
          nonFoundAccountId,
          messageToSign,
          uiNavigation
        );
      }).rejects.toThrowError("account not found");

      // Then
      expect(uiNavigation).toBeCalledTimes(0);
    });

    it("calls the tracking for error", async () => {
      // When
      await expect(async () => {
        await signMessageLogic(
          context,
          nonFoundAccountId,
          messageToSign,
          uiNavigation
        );
      }).rejects.toThrow();

      // Then
      expect(mockPlatformSignMessageRequested).toBeCalledTimes(1);
      expect(mockPlatformSignMessageFail).toBeCalledTimes(1);
    });
  });

  describe("when account found is not of type 'Account'", () => {
    // Given
    const tokenAccountId = "15";
    const messageToSign = "Message to sign";
    context.accounts = [
      createTokenAccount(tokenAccountId),
      ...context.accounts,
    ];

    it("returns an error", async () => {
      // When
      await expect(async () => {
        await signMessageLogic(
          context,
          tokenAccountId,
          messageToSign,
          uiNavigation
        );
      }).rejects.toThrowError("account provided should be the main one");

      // Then
      expect(uiNavigation).toBeCalledTimes(0);
    });

    it("calls the tracking for error", async () => {
      // When
      await expect(async () => {
        await signMessageLogic(
          context,
          tokenAccountId,
          messageToSign,
          uiNavigation
        );
      }).rejects.toThrow();

      // Then
      expect(mockPlatformSignMessageRequested).toBeCalledTimes(1);
      expect(mockPlatformSignMessageFail).toBeCalledTimes(1);
    });
  });

  describe("when inner call prepareMessageToSign raise an error", () => {
    // Given
    const accountId = "ethereumjs:2:ethereum:0x012:";
    const messageToSign = "Message to sign";
    const spyPrepareMessageToSign = jest.spyOn(
      signMessage,
      "prepareMessageToSign"
    );

    beforeEach(() => spyPrepareMessageToSign.mockClear());

    it("returns an error", async () => {
      // Given
      spyPrepareMessageToSign.mockImplementationOnce(() => {
        throw new Error("Some error");
      });

      // When
      await expect(async () => {
        await signMessageLogic(context, accountId, messageToSign, uiNavigation);
      }).rejects.toThrowError("Some error");

      // Then
      expect(uiNavigation).toBeCalledTimes(0);
    });

    it("calls the tracking for error", async () => {
      // Given
      spyPrepareMessageToSign.mockImplementationOnce(() => {
        throw new Error("Some error");
      });

      // When
      await expect(async () => {
        await signMessageLogic(context, accountId, messageToSign, uiNavigation);
      }).rejects.toThrow();

      // Then
      expect(mockPlatformSignMessageRequested).toBeCalledTimes(1);
      expect(mockPlatformSignMessageFail).toBeCalledTimes(1);
    });
  });
});

function createAppManifest(id = "1"): AppManifest {
  return {
    id,
    private: false,
    name: "New App Manifest",
    url: "https://www.ledger.com",
    homepageUrl: "https://www.ledger.com",
    supportUrl: "https://www.ledger.com",
    icon: null,
    platform: "all",
    apiVersion: "1.0.0",
    manifestVersion: "1.0.0",
    branch: "debug",
    params: undefined,
    categories: [],
    currencies: "*",
    content: {
      shortDescription: {
        en: "short description",
      },
      description: {
        en: "description",
      },
    },
    permissions: [],
    domains: [],
  };
}

function createContextContainingAccountId(
  tracking: Record<string, jest.Mock>,
  ...accountIds: string[]
): WebPlatformContext {
  return {
    manifest: createAppManifest(),
    accounts: [
      ...accountIds.map((val) => createFixtureAccount(val)),
      createFixtureAccount(),
    ],
    tracking,
  };
}

function createSignedOperation(): SignedOperation {
  const operation = {
    id: "42",
    hash: "hashed",
    type: "IN" as OperationType,
    value: new BigNumber(0),
    fee: new BigNumber(0),
    senders: [],
    recipients: [],
    blockHeight: null,
    blockHash: null,
    accountId: "14",
    date: new Date(),
    extra: {},
  };
  return {
    operation,
    signature: "Signature",
    expirationDate: null,
  };
}

function createSignedOperationRaw(): SignedOperationRaw {
  const rawOperation = {
    id: "12",
    hash: "123456",
    type: "CREATE" as OperationType,
    value: "0",
    fee: "0",
    senders: [],
    recipients: [],
    blockHeight: null,
    blockHash: null,
    accountId: "12",
    date: "01/01/1970",
    extra: {},
  };
  return {
    operation: rawOperation,
    signature: "Signature",
    expirationDate: null,
  };
}

function createPlatformAccount() {
  return {
    id: "12",
    name: "",
    address: "",
    currency: "",
    balance: new BigNumber(0),
    spendableBalance: new BigNumber(0),
    blockHeight: 0,
    lastSyncDate: new Date(),
  };
}

function createMessageData() {
  return {
    currency: createFixtureCryptoCurrency("eth"),
    path: "path",
    derivationMode: "ethM" as DerivationMode,
    message: "default message",
    rawMessage: "raw default message",
  };
}

function createTokenAccount(id = "32"): TokenAccount {
  return {
    type: "TokenAccount",
    id,
    parentId: "whatever",
    token: createTokenCurrency(),
    balance: new BigNumber(0),
    spendableBalance: new BigNumber(0),
    creationDate: new Date(),
    operationsCount: 0,
    operations: [],
    pendingOperations: [],
    starred: false,
    balanceHistoryCache: {
      WEEK: { latestDate: null, balances: [] },
      HOUR: { latestDate: null, balances: [] },
      DAY: { latestDate: null, balances: [] },
    },
    swapHistory: [],
  };
}

function createTokenCurrency(): TokenCurrency {
  return {
    type: "TokenCurrency",
    id: "3",
    contractAddress: "",
    parentCurrency: createFixtureCryptoCurrency("eth"),
    tokenType: "",
    //-- CurrencyCommon
    name: "",
    ticker: "",
    units: [],
  };
}

function createRawEtherumTransaction(): RawPlatformTransaction {
  return {
    family: "ethereum" as any,
    amount: "1000",
    recipient: "0x0123456",
    nonce: 8,
    data: "Some data...",
    gasPrice: "0,7",
    gasLimit: "1,2",
  };
}
