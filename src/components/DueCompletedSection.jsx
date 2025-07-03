import React from "react";

function DueCompletedSection({transactionList, cardList, toggleCompletion}) {
  return (
    <div className="due-completed-section">
      <h2>✅ Dues completed</h2>

      {transactionList
        .filter((tran) => tran.isCompleted)
        .map((tranComp) => {
          const relatedCard = cardList.find(
            (c) => c.cardName === tranComp.cardName
          );
          return (
            <div key={tranComp.id} className="due-soon-card">
              <p>
                <strong>Card:</strong> {tranComp.cardName}
              </p>
              <p>
                <strong>Transaction:</strong> {tranComp.transaction}
              </p>
              <p>
                <strong>Merchant:</strong> {tranComp.merchantName}
              </p>
              <p>
                <strong>Amount:</strong> ₱{tranComp.amount}
              </p>
              <p>
                <strong>Transaction Date:</strong> {tranComp.transactionDate}
              </p>
              <p>
                <strong>Due Date:</strong> {relatedCard?.dueDate}
              </p>
              <p>
                Status: {tranComp.isCompleted ? "✅ Completed" : "❌ Pending"}
              </p>
              <button onClick={() => toggleCompletion(tranComp)}>
                Mark as {tranComp.isCompleted ? "Pending" : "Done"}
              </button>
            </div>
          );
        })}
    </div>
  );
}
export { DueCompletedSection };
