import { Account, TransactionStatus } from "../../types";
import { Transaction } from "./types";
import {
  AmountRequired,
  FeeNotLoaded,
  InvalidAddress,
  InvalidAddressBecauseDestinationIsAlsoSource,
  NotEnoughBalance,
  RecipientRequired,
} from "@ledgerhq/errors";
import { BigNumber } from "bignumber.js";
import { isValidAddress } from "@celo/utils/lib/address";
import { CeloAllFundsWarning } from "./errors";
import { getVote } from "./logic";

// Arbitrary buffer for paying fees of next transactions. 0.05 Celo for ~100 transactions
const FEES_SAFETY_BUFFER = new BigNumber(5000000000000000);

const getTransactionStatus = async (
  account: Account,
  transaction: Transaction
): Promise<TransactionStatus> => {
  const errors: any = {};
  const warnings: any = {};
  const useAllAmount = !!transaction.useAllAmount;

  if (account.freshAddress === transaction.recipient) {
    errors.recipient = new InvalidAddressBecauseDestinationIsAlsoSource();
  }

  if (!transaction.fees || !transaction.fees.gt(0)) {
    errors.fees = new FeeNotLoaded();
  }

  const estimatedFees = transaction.fees || new BigNumber(0);

  let amount: BigNumber = new BigNumber(0);
  if (
    useAllAmount &&
    (transaction.mode === "unlock" || transaction.mode === "vote")
  ) {
    amount = account.celoResources?.nonvotingLockedBalance ?? new BigNumber(0);
  } else if (useAllAmount && transaction.mode === "revoke") {
    const revoke = getVote(account, transaction.recipient, transaction.index);
    if (revoke?.amount) amount = revoke.amount;
  } else if (useAllAmount) {
    amount = account.spendableBalance.minus(estimatedFees);
  } else {
    amount = new BigNumber(transaction.amount);
  }

  if (amount.lt(0)) amount = new BigNumber(0);

  if (
    !errors.amount &&
    account.celoResources?.lockedBalance.gt(0) &&
    (transaction.useAllAmount ||
      account.spendableBalance.minus(amount).lt(FEES_SAFETY_BUFFER))
  ) {
    warnings.amount = new CeloAllFundsWarning();
  }

  if (!["register", "withdraw", "activate"].includes(transaction.mode)) {
    if (amount.lte(0) && !useAllAmount) {
      errors.amount = new AmountRequired();
    }
  }

  const totalSpent = amount.plus(estimatedFees);

  if (transaction.mode === "unlock" || transaction.mode === "vote") {
    if (
      account.celoResources?.nonvotingLockedBalance &&
      amount.gt(account.celoResources?.nonvotingLockedBalance)
    ) {
      errors.amount = new NotEnoughBalance();
    }
  } else if (transaction.mode === "revoke") {
    const revoke = getVote(account, transaction.recipient, transaction.index);
    if (revoke?.amount && amount.gt(revoke.amount))
      errors.amount = new NotEnoughBalance();
  } else {
    if (totalSpent.gt(account.spendableBalance)) {
      errors.amount = new NotEnoughBalance();
    }
  }

  if (!errors.amount && account.spendableBalance.lt(estimatedFees)) {
    errors.amount = new NotEnoughBalance();
  }

  if (transaction.mode === "send") {
    if (!transaction.recipient) {
      errors.recipient = new RecipientRequired();
    } else if (!isValidAddress(transaction.recipient)) {
      errors.recipient = new InvalidAddress("", {
        currencyName: account.currency.name,
      });
    }
  }

  return Promise.resolve({
    errors,
    warnings,
    estimatedFees,
    amount,
    totalSpent,
  });
};

export default getTransactionStatus;
