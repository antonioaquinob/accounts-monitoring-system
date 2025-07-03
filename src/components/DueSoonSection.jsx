import React from "react";

function DueSoonSection({dueSoonTransactions, cardList, toggleCompletion}) {
  return (
    <div className="due-soon-section">
      <h2>🔔 Transactions Near Due Date</h2>
      {dueSoonTransactions.filter((trans) => !trans.isCompleted).length ===
      0 ? (
        <p>No upcoming due dates based on recent transactions.</p>
      ) : (
        dueSoonTransactions
          .filter((trans) => !trans.isCompleted)
          .map((trans) => {
            const relatedCard = cardList.find(
              (c) => c.cardName === trans.cardName
            );
            return (
              <div key={trans.id} className="due-soon-card">
                <p>
                  <strong>Card:</strong> {trans.cardName}
                </p>
                <p>
                  <strong>Transaction:</strong> {trans.transaction}
                </p>
                <p>
                  <strong>Merchant:</strong> {trans.merchantName}
                </p>
                <p>
                  <strong>Amount:</strong> ₱{trans.amount}
                </p>
                <p>
                  <strong>Transaction Date:</strong> {trans.transactionDate}
                </p>
                <p>
                  <strong>Due Date:</strong> {relatedCard?.dueDate}
                </p>
                <p>
                  Status: {trans.isCompleted ? "✅ Completed" : "❌ Pending"}
                </p>
                <button onClick={() => toggleCompletion(trans)}>
                  Mark as {trans.isCompleted ? "Pending" : "Done"}
                </button>
              </div>
            );
          })
      )}
    </div>
  );
}

export { DueSoonSection };
