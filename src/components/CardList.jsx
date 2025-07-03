import React from "react";

function CardList({card, cardEditID, startCardEdit, deleteCard}) {
  return (
    <div key={card.id}>
      <p>Card name: {card.cardName}</p>
      <p>Bank name: {card.bankName}</p>
      <p>Card's last four digit: {card.lastFour}</p>
      <p>Card's statement date: {card.statementDate}</p>
      <p>Card's due date: {card.dueDate}</p>

      {cardEditID === null && (
        <button onClick={() => startCardEdit(card)}>Edit</button>
      )}
      <button onClick={() => deleteCard(card.id)}>Delete</button>
    </div>
  );
}

export { CardList };
