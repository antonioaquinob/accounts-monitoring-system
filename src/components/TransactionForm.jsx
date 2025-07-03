import React from "react";

function TransactionForm(
    {cardList, 
    transaction, 
    transCardName, 
    merchantName,
    amount,
    dateOfTrans,
    isTransactionCompleted,
    setTransaction,
    setTransCardName,
    setMerchantName,
    setAmount,
    setDateOfTrans,
    setIsTransactionCompleted,
    transEditID,
    addEditTrans}) {
  return (
    <div className="transaction-panel">
      <input
        type="text"
        placeholder="Enter transaction details..."
        value={transaction}
        onChange={(e) => setTransaction(e.target.value)}
      />
      <select
        value={transCardName}
        onChange={(e) => setTransCardName(e.target.value)}
      >
        <option value="">Select card</option>
        {cardList.map((card) => (
          <option key={card.id} value={card.cardName}>
            {card.cardName}
          </option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Enter merchant name..."
        value={merchantName}
        onChange={(e) => setMerchantName(e.target.value)}
      />

      <input
        type="number"
        placeholder="Enter amount..."
        value={amount}
        onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
      />

      <input
        type="date"
        value={dateOfTrans.toISOString().split("T")[0]}
        onChange={(e) => setDateOfTrans(new Date(e.target.value))}
      />
      <label>
        <input
          type="checkbox"
          checked={isTransactionCompleted}
          onChange={(e) => setIsTransactionCompleted(e.target.checked)}
        />
        Completed
      </label>

      <button onClick={addEditTrans}>
        {transEditID === null ? "Add" : "Update"}
      </button>
    </div>
  );
}

export { TransactionForm };
