export const getDueSoonTransactions = (transactions, cards, remindDays) => {
  const today = new Date();

  return transactions.filter((trans) => {
    const card = cards.find((c) => c.cardName === trans.cardName);
    if (!card || !card.dueDate) return false;

    const dueDate = new Date(card.dueDate);
    const timeDiff = dueDate - today;
    const dayDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    const shouldRemind = dayDiff >= 0 && dayDiff <= remindDays;

    console.log(`📌 Transaction: ${trans.transaction}`);
    console.log(`📌 Remind: ${remindDays}`);
    console.log(`📅 Due Date: ${dueDate.toISOString().split("T")[0]}`);
    console.log(`📅 Today: ${today.toISOString().split("T")[0]}`);
    console.log(`🧮 Days left: ${dayDiff}`);
    console.log(`✅ Should Remind? ${shouldRemind}`);

    return shouldRemind;
  });
};
