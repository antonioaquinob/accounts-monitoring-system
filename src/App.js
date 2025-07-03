import "./App.css";
import { useEffect, useState } from "react";
import {
  fetchCollection,
  getDocumentRef,
  addDocument,
  updateDocument,
  deleteDocument,
} from "./utils/firestoreUtils";

import { db } from "./firebaseConfig.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { analytics } from "firebase/analytics";
import { Navbar } from "./components/Navbar.jsx";
import { CardForm } from "./components/CardForm.jsx";
import { CardList } from "./components/CardList.jsx";
import { TransactionForm } from "./components/TransactionForm.jsx";
import { TransactionList } from "./components/TransactionList.jsx";
import { DueSoonSection } from "./components/DueSoonSection.jsx";
import { DueCompletedSection } from "./components/DueCompletedSection.jsx";
import { SettingForm } from "./components/SettingForm.jsx";
import { SettingList } from "./components/SettingList.jsx";

import { getDueSoonTransactions } from "./utils/reminderUtils";
import { formatDate } from "./utils/dateUtils";
import { saveToLocal } from "./utils/storageUtils";
import { isValidCard, isValidTransaction } from "./utils/validationUtils";

function App() {
  const [cardName, setCardName] = useState("");
  const [bankName, setBankName] = useState("");
  const [lastFour, setLastFour] = useState("");
  const [cardLimit, setCardLimit] = useState(0);
  const [statementDate, setStatementDate] = useState(new Date());
  const [dueDate, setDueDate] = useState(new Date());
  const [cardList, setCardList] = useState([]);
  const [cardEditID, setCardEditID] = useState(null);

  const [transCardName, setTransCardName] = useState("");
  const [transaction, setTransaction] = useState("");
  const [merchantName, setMerchantName] = useState("");
  const [amount, setAmount] = useState(0);
  const [isTransactionCompleted, setIsTransactionCompleted] = useState(false);
  const [dateOfTrans, setDateOfTrans] = useState(new Date());
  const [transactionList, setTransactionList] = useState([]);
  const [transEditID, setTransEditID] = useState(null);

  const saveTransactionToLocalStorage = () => {
    localStorage.setItem("transactionList", JSON.stringify(transactionList));
  };

  useEffect(() => {
    const fetchTransInfo = async () => {
      try {
        const firebaseTransData = await fetchCollection(db, "transactionList");
        const transaction = firebaseTransData.docs.map((trans) => ({
          id: trans.id,
          ...trans.data(),
        }));

        setTransactionList(transaction);
      } catch (err) {
        // will go here whenever fetching data from db encoutered error(s)
        const localData = localStorage.getItem("transactionList");
        if (localData) {
          setTransactionList(JSON.parse(localData));
        }
        return toast.error("Error fetching data, local storage will be used.");
      }
    };

    fetchTransInfo();
  }, []);

  useEffect(() => {
    saveTransactionToLocalStorage();
  }, [transactionList]);

  const [currentPage, setCurrentPage] = useState("Transaction");

  {
    /* settings management */
  }
  const [settingsList, setSettingsList] = useState([]);
  const [remindCardDueDate, setRemindCardDueDate] = useState(0);
  const [settingsListEditID, setSettingsListEditID] = useState(null);

  const getDueSoonTransactions = (transactions, cards, remindDays) => {
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

  const toggleCompletion = async (trans) => {
    const updated = { ...trans, isCompleted: !trans.isCompleted };

    await updateDocument(db, "transactionList", trans.id, {
      isCompleted: updated.isCompleted,
    });

    setTransactionList(
      transactionList.map((t) => (t.id === trans.id ? updated : t))
    );
  };

  const saveSettingsToLocalStorage = () => {
    localStorage.setItem("settingsList", JSON.stringify(settingsList));
  };
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const firebaseSettingsData = await fetchCollection(db, "settingsList");
        const settings = firebaseSettingsData.docs.map((setting) => ({
          id: setting.id,
          ...setting.data(),
        }));

        setSettingsList(settings);

        // if (settings.length > 0) {
        //   setRemindCardDueDate(settings[0].remindCardDueDate); // ✅ auto sync with latest settings
        // }
      } catch (err) {
        const localData = localStorage.getItem("settingsList");
        if (localData) {
          const parsed = JSON.parse(localData);
          setSettingsList(parsed);
          if (parsed.length > 0) {
            setRemindCardDueDate(parsed[0].remindCardDueDate); // ✅ fallback to local storage
          }
        }
        return toast.error("Error fetching data, local storage will be used.");
      }
    };

    fetchSettings();
  }, []);

  useEffect(() => {
    saveSettingsToLocalStorage();
  }, [settingsList]);

  const startSettingsEdit = (setting) => {
    setSettingsListEditID(setting.id);
    setRemindCardDueDate(setting.remindCardDueDate);
  };

  const flushSettingsData = () => {
    setRemindCardDueDate(0);
    setSettingsListEditID(null);
  };
  const addEditSettings = async () => {
    if (settingsListEditID === null) {
      // Add new card
      const newSettings = {
        remindCardDueDate: Number(remindCardDueDate),
      };
      try {
        const addSettingsRef = await addDocument(
          db,
          "settingsList",
          newSettings
        );
        setSettingsList([
          ...settingsList,
          { ...newSettings, id: addSettingsRef.id },
        ]);
        toast.success("✅ Settings details successfully added");
      } catch (err) {
        console.error("Firestore error:", err);
        toast.error("❌ Failed to add settings. Please try again.");
      }
      flushSettingsData();
    } else {
      // edit existing settings
      const updateSettings = {
        remindCardDueDate: Number(remindCardDueDate),
      };

      try {
        await updateDocument(
          db,
          "settingsList",
          settingsListEditID,
          updateSettings
        );
        setSettingsList(
          settingsList.map((setting) =>
            setting.id === settingsListEditID
              ? { ...setting, ...updateSettings }
              : setting
          )
        );
        toast.success("✅ Settings details successfully updated");
      } catch (err) {
        console.error("Firestore error:", err);
        toast.error("❌ Failed to update settings. Please try again.");
      }
      flushSettingsData();
    }
  };
  const deleteSettings = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this settings?"
    );

    if (!confirmDelete) {
      return toast.info("❕ Deletion canceled");
    }

    try {
      await deleteDocument(db, "settingsList", id);
      setSettingsList(settingsList.filter((setting) => setting.id !== id));
      toast.success("🗑️ Settings deleted successfully");
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("❌ Failed to delete settings. Please try again.");
    }
  };
  {
    /* Card management */
  }

  const saveCardToLocalStorage = () => {
    localStorage.setItem("cardList", JSON.stringify(cardList));
  };
  useEffect(() => {
    const fetchCardInfo = async () => {
      try {
        const firebaseCardData = await fetchCollection(db, "cardList");
        const cards = firebaseCardData.docs.map((card) => ({
          id: card.id,
          ...card.data(),
        }));
        setCardList(cards);
      } catch (err) {
        // will go here whenever fetching data from db encoutered error(s)
        const localData = localStorage.getItem("cardList");
        if (localData) {
          setCardList(JSON.parse(localData));
        }
        return toast.error("Error fetching data, local storage will be used.");
      }
    };

    fetchCardInfo();
  }, []);

  useEffect(() => {
    saveCardToLocalStorage();
  }, [cardList]);

  const startCardEdit = (card) => {
    setCardEditID(card.id);
    setCardName(card.cardName);
    setBankName(card.bankName);
    setLastFour(card.lastFour);
    setCardLimit(card.cardLimit);
    setStatementDate(new Date(card.statementDate)); // ✅ Convert string to Date
    setDueDate(new Date(card.dueDate)); // ✅ Convert string to Date
  };

  const flushCardData = () => {
    setCardName("");
    setBankName("");
    setLastFour("");
    setCardLimit(0);
    setStatementDate(new Date());
    setDueDate(new Date());
    setCardEditID(null);
  };
  const addEditCard = async () => {
    const validation = isValidCard({
      cardName,
      bankName,
      lastFour,
      cardLimit,
      statementDate,
      dueDate,
    });
    if (!validation.valid) return toast.error(validation.message);

    if (cardEditID === null) {
      // Add new card
      const newCard = {
        cardName: cardName,
        bankName: bankName,
        lastFour: lastFour,
        cardLimit: Number(cardLimit),
        statementDate: statementDate.toISOString().split("T")[0], // format: 'YYYY-MM-DD'
        dueDate: dueDate.toISOString().split("T")[0], // format: 'YYYY-MM-DD'
      };
      try {
        const addCardRef = await addDocument(db, "cardList", newCard);
        setCardList([...cardList, { ...newCard, id: addCardRef.id }]);
        toast.success("✅ Card details successfully added");
      } catch (err) {
        console.error("Firestore error:", err);
        toast.error("❌ Failed to add card. Please try again.");
      }
      flushCardData();
    } else {
      // edit existing card
      const cardRef = getDocumentRef(db, "cardList", cardEditID);
      const updateCard = {
        cardName: cardName,
        bankName: bankName,
        lastFour: lastFour,
        cardLimit: Number(cardLimit),
        statementDate: statementDate.toISOString().split("T")[0], // format: 'YYYY-MM-DD'
        dueDate: dueDate.toISOString().split("T")[0], // format: 'YYYY-MM-DD'
      };

      try {
        const updateCardData = await updateDocument(
          db,
          "cardList",
          cardEditID,
          updateCard
        );
        setCardList(
          cardList.map((card) =>
            card.id === cardEditID ? { ...card, ...updateCard } : card
          )
        );
        toast.success("✅ Card details successfully updated");
      } catch (err) {
        console.error("Firestore error:", err);
        toast.error("❌ Failed to update card. Please try again.");
      }
      flushCardData();
    }
  };

  const deleteCard = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this card?"
    );

    if (!confirmDelete) {
      return toast.info("❕ Deletion canceled");
    }

    try {
      await deleteDocument(db, "cardList", id);
      setCardList(cardList.filter((card) => card.id !== id));
      toast.success("🗑️ Card deleted successfully");
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("❌ Failed to delete card. Please try again.");
    }
  };

  {
    /* Transactions management*/
  }

  const startTransEdit = (trans) => {
    setTransEditID(trans.id);
    setTransaction(trans.transaction);
    setTransCardName(trans.cardName || "");
    setAmount(trans.amount);
    setMerchantName(trans.merchantName);
    setDateOfTrans(new Date(trans.transactionDate)); // ✅ Convert string to Date
    setIsTransactionCompleted(trans.isCompleted ?? false); // defaults to false if undefined
  };

  const flushTransData = () => {
    setTransaction("");
    setTransCardName("");
    setMerchantName("");
    setAmount(0);
    setDateOfTrans(new Date());
    setTransEditID(null);
  };

  const addEditTrans = async () => {
    const validation = isValidTransaction({
      transaction,
      transCardName,
      merchantName,
      amount,
      dateOfTrans,
    });
    if (!validation.valid) return toast.error(validation.message);

    if (transEditID === null) {
      // Add new trans
      const newTrans = {
        transaction: transaction,
        cardName: transCardName,
        merchantName: merchantName,
        amount: Number(amount),
        transactionDate: dateOfTrans.toISOString().split("T")[0], // format: 'YYYY-MM-DD'
        isCompleted: isTransactionCompleted,
      };
      try {
        const addTransRef = await addDocument(db, "transactionList", newTrans);
        setTransactionList([
          ...transactionList,
          { ...newTrans, id: addTransRef.id },
        ]);
        toast.success("✅ Transaction details successfully added");
      } catch (err) {
        console.error("Firestore error:", err);
        toast.error("❌ Failed to add card. Please try again.");
      }
      flushTransData();
    } else {
      // edit existing trans
      const updateTrans = {
        transaction: transaction,
        cardName: transCardName,
        merchantName: merchantName,
        amount: Number(amount),
        transactionDate: dateOfTrans.toISOString().split("T")[0], // format: 'YYYY-MM-DD'
        isCompleted: isTransactionCompleted,
      };

      try {
        const updateTransData = await await updateDocument(
          db,
          "transactionList",
          transEditID,
          updateTrans
        );
        setTransactionList(
          transactionList.map((trans) =>
            trans.id === transEditID ? { ...trans, ...updateTrans } : trans
          )
        );
        toast.success("✅ Transaction details successfully updated");
      } catch (err) {
        console.error("Firestore error:", err);
        toast.error("❌ Failed to update card. Please try again.");
      }
      flushTransData();
    }
  };

  const deleteTrans = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this transaction?"
    );

    if (!confirmDelete) {
      return toast.info("❕ Deletion canceled");
    }

    try {
      await deleteDocument(db, "transactionList", id);
      setTransactionList(transactionList.filter((trans) => trans.id !== id));
      toast.success("🗑️ Transaction deleted successfully");
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("❌ Failed to delete transaction. Please try again.");
    }
  };

  const dueSoonTransactions = getDueSoonTransactions(
    transactionList,
    cardList,
    parseInt(remindCardDueDate)
  );

  return (
    <div className="App">
      <Navbar setCurrentPage={setCurrentPage} />
      {/* -- Settings management -- */}
      {currentPage === "Settings" && (
        <div>
          <SettingForm
            remindCardDueDate={remindCardDueDate}
            setRemindCardDueDate={setRemindCardDueDate}
            addEditSettings={addEditSettings}
            settingsListEditID={settingsListEditID}
          />

          {settingsList.map((setting) => (
            <SettingList
              setting={setting}
              settingsListEditID={settingsListEditID}
              startSettingsEdit={startSettingsEdit}
              deleteSettings={deleteSettings}
            />
          ))}
        </div>
      )}

      {/* --Card management -- */}
      {currentPage === "Card" && (
        <div>
          <CardForm
            cardName={cardName}
            bankName={bankName}
            lastFour={lastFour}
            cardLimit={cardLimit}
            statementDate={statementDate}
            dueDate={dueDate}
            setCardName={setCardName}
            setBankName={setBankName}
            setLastFour={setLastFour}
            setCardLimit={setCardLimit}
            setStatementDate={setStatementDate}
            setDueDate={setDueDate}
            cardEditID={cardEditID}
            addEditCard={addEditCard}
          />
          {cardList.map((card) => (
            <CardList
              card={card}
              cardEditID={cardEditID}
              startCardEdit={startCardEdit}
              deleteCard={deleteCard}
            />
          ))}
        </div>
      )}

      {/* --Transaction management -- */}
      {currentPage === "Transaction" && (
        <div>
          <TransactionForm
            cardList={cardList}
            transaction={transaction}
            transCardName={transCardName}
            merchantName={merchantName}
            amount={amount}
            dateOfTrans={dateOfTrans}
            isTransactionCompleted={isTransactionCompleted}
            setTransaction={setTransaction}
            setTransCardName={setTransCardName}
            setMerchantName={setMerchantName}
            setAmount={setAmount}
            setDateOfTrans={setDateOfTrans}
            setIsTransactionCompleted={setIsTransactionCompleted}
            transEditID={transEditID}
            addEditTrans={addEditTrans}
          />

          {transactionList.map((trans) => (
            <TransactionList
              trans={trans}
              transEditID={transEditID}
              startTransEdit={startTransEdit}
              toggleCompletion={toggleCompletion}
              deleteTrans={deleteTrans}
            />
          ))}

          {currentPage === "Transaction" && (
            <>
              {/* 🔔 Due Soon Transactions Section */}
              <DueSoonSection
                dueSoonTransactions={dueSoonTransactions}
                cardList={cardList}
                toggleCompletion={toggleCompletion}
              />

              {/* ✅ Dues completed*/}
              <DueCompletedSection
                transactionList={transactionList}
                cardList={cardList}
                toggleCompletion={toggleCompletion}
              />
            </>
          )}
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
      />
    </div>
  );
}

export default App;
