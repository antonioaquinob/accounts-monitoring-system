import React from "react";

function TransactionList({trans, transEditID, startTransEdit, toggleCompletion, deleteTrans}) {
  return (
    <div key={trans.id}>
      <p>Transaction: {trans.transaction}</p>
      <p>Card used: {trans.cardName}</p>
      <p>Merchant name:{trans.merchantName}</p>
      <p>Amount: {trans.amount}</p>
      <p>Transaction date: {trans.transactionDate}</p>
      <p>Status: {trans.isCompleted ? "✅ Completed" : "❌ Pending"}</p>
      {transEditID === null && (
        <button onClick={() => startTransEdit(trans)}>Edit</button>
      )}
      <button onClick={() => toggleCompletion(trans)}>
        Mark as {trans.isCompleted ? "Pending" : "Done"}
      </button>
      <button onClick={() => deleteTrans(trans.id)}>Delete</button>
    </div>
  );
}

export { TransactionList };
