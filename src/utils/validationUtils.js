// utils/validationUtils.js

export const isValidCard = ({ cardName, bankName, lastFour, cardLimit, statementDate, dueDate }) => {
  if (!cardName.trim() || !bankName.trim() || !lastFour.trim()) {
    return { valid: false, message: '🚫 Please fill in all required card fields' };
  }

  if (Number(cardLimit) <= 0) {
    return { valid: false, message: '🚫 Card limit must be greater than 0' };
  }

  if (!(statementDate instanceof Date) || isNaN(statementDate)) {
    return { valid: false, message: '🚫 Invalid statement date' };
  }

  if (!(dueDate instanceof Date) || isNaN(dueDate)) {
    return { valid: false, message: '🚫 Invalid due date' };
  }

  return { valid: true };
};

export const isValidTransaction = ({ transaction, transCardName, merchantName, amount, dateOfTrans }) => {
  if (!transaction.trim() || !transCardName.trim() || !merchantName.trim()) {
    return { valid: false, message: '🚫 Please fill in all required transaction fields' };
  }

  if (Number(amount) <= 0) {
    return { valid: false, message: '🚫 Amount must be greater than 0' };
  }

  if (!(dateOfTrans instanceof Date) || isNaN(dateOfTrans)) {
    return { valid: false, message: '🚫 Invalid transaction date' };
  }

  return { valid: true };
};
