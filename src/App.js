import './App.css';
import { useEffect, useState } from 'react';
import {collection, getDocs, addDoc, updateDoc, deleteDoc, doc} from 'firebase/firestore'
import {db} from './firebaseConfig.js'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { settings } from 'firebase/analytics';
function App() {
  const [cardName, setCardName] = useState('')
  const [bankName, setBankName] = useState('')
  const [lastFour, setLastFour] = useState('')
  const [cardLimit, setCardLimit] = useState(0)
  const [statementDate, setStatementDate] = useState(new Date())
  const [dueDate, setDueDate] = useState(new Date())
  const [cardList, setCardList] = useState([]);
  const [cardEditID, setCardEditID] = useState(null)

  
  const [transCardName, setTransCardName] = useState('');
  const [transaction, setTransaction] = useState('')
  const [merchantName, setMerchantName] = useState('')
  const [amount, setAmount] = useState(0)
  const [dateOfTrans, setDateOfTrans] = useState(new Date())
  const [transactionList, setTransactionList] = useState([]);
  const [transEditID, setTransEditID] = useState(null)
  
  const [currentPage, setCurrentPage] = useState('Transaction')

  {/* settings management */}
  const [settingsList, setSettingsList] = useState([])
  const [remindCardDueDate, setRemindCardDueDate] = useState(0)
  const [settingsListEditID, setSettingsListEditID] = useState(null)

  const getDueSoonTransactions = (transactions, cards, remindDays) => {
  const today = new Date();

  return transactions.filter(trans => {
    const transDate = new Date(trans.transactionDate);
    const card = cards.find(c => c.cardName === trans.cardName);
    if (!card) return false;

    const dueDate = new Date(card.dueDate);
    // Align due date to current year and month
    dueDate.setFullYear(today.getFullYear());
    dueDate.setMonth(today.getMonth());

    const diffInDays = Math.ceil((dueDate - transDate) / (1000 * 60 * 60 * 24));

    return (
      transDate.getMonth() === today.getMonth() &&
      transDate.getFullYear() === today.getFullYear() &&
      diffInDays >= 0 &&
      diffInDays <= remindDays
    );
  });
};

  const saveSettingsToLocalStorage = ()=>{
    localStorage.setItem('settingsList', JSON.stringify(settingsList))
  }
  useEffect(()=>{
    const fetchSettings = async ()=>{
      try {
        const firebaseSettingsData = await getDocs(collection(db, 'settingsList'));
      const settings = firebaseSettingsData.docs.map(setting =>({
        id:setting.id,
        ...setting.data()
      }));

      setSettingsList(settings)
      }
      catch(err){
        // will go here whenever fetching data from db encoutered error(s)
        const localData = localStorage.getItem('settingsList');
        if (localData){
          setSettingsList(JSON.parse(localData))
        }
        return toast.error('Error fetching data, local storage will be used.');
      }
    };

    fetchSettings();
  }, [])

  useEffect(()=>{
    saveSettingsToLocalStorage();
  }, [settingsList]);

  
  const startSettingsEdit = (setting) =>{
    setSettingsListEditID(setting.id)
    setRemindCardDueDate(setting.remindCardDueDate)
  }

  const flushSettingsData= ()=>{
    setRemindCardDueDate(0)
    setSettingsListEditID(null)
  }
  const addEditSettings = async ()=>{
    
    if(settingsListEditID === null){
      // Add new card
      const newSettings = {
        remindCardDueDate: Number(remindCardDueDate),
    }
    try{ 
      const addSettingsRef = await addDoc(collection(db, 'settingsList'), newSettings)
      setSettingsList([...settingsList, {...newSettings, id: addSettingsRef.id}])
      toast.success('✅ Settings details successfully added');
    }catch(err){
      console.error('Firestore error:', err)
      toast.error('❌ Failed to add settings. Please try again.');
    }
    flushSettingsData()
  }else{
    // edit existing settings
    const settingsRef = doc(db, 'settingsList', cardEditID)
    const updateSettings = {
        remindCardDueDate: Number(remindCardDueDate),
    }
    
    try{ 
      const updateSettingsData = await updateDoc(settingsRef, updateSettings)
      setSettingsList(settingsList.map(
        setting => setting.id === settingsListEditID
          ? { ...setting, ...updateSettingsData }
          : setting
      ));
      toast.success('✅ Settings details successfully updated');
    }catch(err){
      console.error('Firestore error:', err)
      toast.error('❌ Failed to update settings. Please try again.');
    }
    flushSettingsData();
  }
}
const deleteSettings = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this settings?');

    if (!confirmDelete) {
      return toast.info('❕ Deletion canceled');
    }
  
    try {
      await deleteDoc(doc(db, 'settingsList', id));
      setSettingsList(settingsList.filter(setting => setting.id !== id));
      toast.success('🗑️ Settings deleted successfully');
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('❌ Failed to delete settings. Please try again.');
    }
  };
  {/* Card management */}

  const saveCardToLocalStorage = ()=>{
    localStorage.setItem('cardList', JSON.stringify(cardList))
  }
  useEffect(()=>{
    const fetchCardInfo = async ()=>{
      try {
        const firebaseCardData = await getDocs(collection(db, 'cardList'));
      const cards = firebaseCardData.docs.map(card =>({
        id:card.id,
        ...card.data()
      }));

      setCardList(cards)
      }
      catch(err){
        // will go here whenever fetching data from db encoutered error(s)
        const localData = localStorage.getItem('cardList');
        if (localData){
          setCardList(JSON.parse(localData))
        }
        return toast.error('Error fetching data, local storage will be used.');
      }
    };

    fetchCardInfo();
  }, [])

  useEffect(()=>{
    saveCardToLocalStorage();
  }, [cardList]);

  const startCardEdit = (card) =>{
    setCardEditID(card.id)
    setCardName(card.cardName)
    setBankName(card.bankName)
    setLastFour(card.lastFour)
    setCardLimit(card.cardLimit)
    setStatementDate(new Date(card.statementDate)); // ✅ Convert string to Date
    setDueDate(new Date(card.dueDate));             // ✅ Convert string to Date
  }

  const flushCardData= ()=>{
    setCardName('')
    setBankName('')
    setLastFour('')
    setCardLimit(0)
    setStatementDate(new Date())
    setDueDate(new Date())
    setCardEditID(null)
  }
  const addEditCard = async ()=>{
    if(!cardName.trim() || !bankName.trim() || !lastFour.trim()) return toast.error('🚫 Please fill in all required fields');

    if(cardLimit === 0) return toast.error('🚫 Card limit must be greater than 0');

    // Check if dates are valid
    if (!(statementDate instanceof Date) || isNaN(statementDate)) {
      return toast.error('🚫 Invalid statement date');
    }

    if (!(dueDate instanceof Date) || isNaN(dueDate)) {
      return toast.error('🚫 Invalid due date');
    }
    
    if(cardEditID === null){
      // Add new card
      const newCard = {
        cardName: cardName,
        bankName: bankName,
        lastFour: lastFour,
        cardLimit: Number(cardLimit),
        statementDate: statementDate.toISOString().split('T')[0], // format: 'YYYY-MM-DD'
        dueDate: dueDate.toISOString().split('T')[0],             // format: 'YYYY-MM-DD'
    }
    try{ 
      const addCardRef = await addDoc(collection(db, 'cardList'), newCard)
      setCardList([...cardList, {...newCard, id: addCardRef.id}])
      toast.success('✅ Card details successfully added');
    }catch(err){
      console.error('Firestore error:', err)
      toast.error('❌ Failed to add card. Please try again.');
    }
    flushCardData()
  }else{
    // edit existing card
    const cardRef = doc(db, 'cardList', cardEditID)
    const updateCard = {
        cardName: cardName,
        bankName: bankName,
        lastFour: lastFour,
        cardLimit: Number(cardLimit),
        statementDate: statementDate.toISOString().split('T')[0], // format: 'YYYY-MM-DD'
        dueDate: dueDate.toISOString().split('T')[0],             // format: 'YYYY-MM-DD'
    }
    
    try{ 
      const updateCardData = await updateDoc(cardRef, updateCard)
      setCardList(cardList.map(
        card => card.id === cardEditID
          ? { ...card, ...updateCard }
          : card
      ));
      toast.success('✅ Card details successfully updated');
    }catch(err){
      console.error('Firestore error:', err)
      toast.error('❌ Failed to update card. Please try again.');
    }
    flushCardData();
  }
}

const deleteCard = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this card?');

    if (!confirmDelete) {
      return toast.info('❕ Deletion canceled');
    }
  
    try {
      await deleteDoc(doc(db, 'cardList', id));
      setCardList(cardList.filter(card => card.id !== id));
      toast.success('🗑️ Card deleted successfully');
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('❌ Failed to delete card. Please try again.');
    }
  };

  {/* Transactions management*/}
  

  const saveTranssactionToLocalStorage = ()=>{
    localStorage.setItem('transactionList', JSON.stringify(transactionList))
  }

  useEffect(()=>{
    const fetchTransInfo = async ()=>{
      try {
        const firebaseTransData = await getDocs(collection(db, 'transactionList'));
      const transaction = firebaseTransData.docs.map(trans =>({
        id:trans.id,
        ...trans.data()
      }));

      setTransactionList(transaction)
      }
      catch(err){
        // will go here whenever fetching data from db encoutered error(s)
        const localData = localStorage.getItem('transactionList');
        if (localData){
          setTransactionList(JSON.parse(localData))
        }
        return toast.error('Error fetching data, local storage will be used.');
      }
    };

    fetchTransInfo();
  }, [])

  useEffect(()=>{
    saveTranssactionToLocalStorage();
  }, [transactionList]);

  const startTransEdit = (trans) =>{
    setTransEditID(trans.id)
    setTransaction(trans.transaction)
    setTransCardName(trans.cardName || '');
    setAmount(trans.amount)
    setMerchantName(trans.merchantName)
    setDateOfTrans(new Date(trans.transactionDate)); // ✅ Convert string to Date
  }

  const flushTransData= ()=>{
    setTransaction('')
    setTransCardName('');
    setMerchantName('')
    setAmount(0)
    setDateOfTrans(new Date())
    setTransEditID(null)
  }

  const addEditTrans = async ()=>{
    if(!transaction.trim() || !transCardName.trim() || !merchantName.trim()) return toast.error('🚫 Please fill in all required fields');

    if(amount === 0) return toast.error('🚫 Card limit must be greater than 0');

    // Check if dates are valid
    if (!(dateOfTrans instanceof Date) || isNaN(dateOfTrans)) {
      return toast.error('🚫 Invalid transaction date');
    }
    
    if(transEditID === null){
      // Add new trans
      const newTrans = {
        transaction: transaction,
        cardName: transCardName,
        merchantName: merchantName,
        amount: Number(amount),
        transactionDate: dateOfTrans.toISOString().split('T')[0],             // format: 'YYYY-MM-DD'
    }
    try{ 
      const addTransRef = await addDoc(collection(db, 'transactionList'), newTrans)
      setTransactionList([...transactionList, {...newTrans, id: addTransRef.id}])
      toast.success('✅ Transaction details successfully added');
    }catch(err){
      console.error('Firestore error:', err)
      toast.error('❌ Failed to add card. Please try again.');
    }
    flushTransData()
  }else{
    // edit existing trans
    const transRef = doc(db, 'transactionList', transEditID)
    const updateTrans = {
        transaction: transaction,
        cardName: transCardName,
        merchantName: merchantName,
        amount: Number(amount),
        transactionDate: dateOfTrans.toISOString().split('T')[0],             // format: 'YYYY-MM-DD'
    }
    
    try{ 
      const updateTransData = await updateDoc(transRef, updateTrans)
      setTransactionList(transactionList.map(
        trans => trans.id === transEditID
          ? { ...trans, ...updateTrans }
          : trans
      ));
      toast.success('✅ Transaction details successfully updated');
    }catch(err){
      console.error('Firestore error:', err)
      toast.error('❌ Failed to update card. Please try again.');
    }
    flushTransData();
  }
}

const deleteTrans = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this transaction?');

    if (!confirmDelete) {
      return toast.info('❕ Deletion canceled');
    }
  
    try {
      await deleteDoc(doc(db, 'transactionList', id));
      setTransactionList(transactionList.filter(trans => trans.id !== id));
      toast.success('🗑️ Transaction deleted successfully');
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('❌ Failed to delete transaction. Please try again.');
    }
  };

  const dueSoonTransactions = getDueSoonTransactions(transactionList, cardList, parseInt(remindCardDueDate));

  return (
    <div className="App">
     <div className='navButton'>
        <button onClick={()=>setCurrentPage('Card')}>Card management</button>
        <button onClick={()=>setCurrentPage('Transaction')}>Transaction management</button>
        <button onClick={()=>setCurrentPage('Settings')}>Settings</button>
     </div>
    {/* -- Settings management -- */}
    {currentPage === 'Settings' &&(
      <div>
        <div className='settings-panel'>
            <input
            type="number"
            placeholder="Enter days to remind due date"
            value={remindCardDueDate}
            onChange={(e) => setRemindCardDueDate(e.target.value)}
            />
            <button onClick={addEditSettings}>{settingsListEditID === null ? 'Add' : 'Update'}</button>
        </div>
        {settingsList.map(setting=>(
          <div key={setting.id}>
            <p>Remind card due date before: {setting.remindCardDueDate}</p>

            {settingsListEditID === null && <button onClick={()=>startSettingsEdit(setting)}>Edit</button>}
            <button onClick={()=>deleteSettings(setting.id)}>Delete</button>
          </div>
        ))}
      </div>
    )}

    {/* --Card management -- */}
    {currentPage === 'Card' && (
      <div>
          <div className='card-panel'>
            <input type="text" 
            placeholder='Enter card name...' 
            value={cardName} 
            onChange={(e)=> setCardName(e.target.value)}
            />

            <input type="text" 
            placeholder='Enter bank name...' 
            value={bankName} 
            onChange={(e)=> setBankName(e.target.value)}
            />

            <input type="text" 
            placeholder='Enter last four digit...' 
            value={lastFour} 
            onChange={(e)=> setLastFour(e.target.value)}
            />

            <input
            type="number"
            placeholder="Enter card limit"
            value={cardLimit}
            onChange={(e) => setCardLimit(parseFloat(e.target.value) || 0)}
            />

            <input
            type="date"
            value={statementDate.toISOString().split('T')[0]}
            onChange={(e) => setStatementDate(new Date(e.target.value))}
            />
          
            <input
            type="date"
            value={dueDate.toISOString().split('T')[0]}
            onChange={(e) => setDueDate(new Date(e.target.value))}
            />

            <button onClick={addEditCard}>{cardEditID === null ? 'Add' : 'Update'}</button>
        </div>

        {cardList.map(card=>(
          <div key={card.id}>
            <p>Card name: {card.cardName}</p>
            <p>Bank name: {card.bankName}</p>
            <p>Card's last four digit: {card.lastFour}</p>
            <p>Card's statement date: {card.statementDate}</p>
            <p>Card's due date: {card.dueDate}</p>

            {cardEditID === null && <button onClick={()=>startCardEdit(card)}>Edit</button>}
            <button onClick={()=>deleteCard(card.id)}>Delete</button>
          </div>
        ))}
      </div>
    )}

    {/* --Transaction management -- */}
    {currentPage === 'Transaction' && (
      <div>
        <div className='transaction-panel'>
          <input type="text" 
            placeholder='Enter transaction details...' 
            value={transaction} 
            onChange={(e)=> setTransaction(e.target.value)}
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

            <input type="text" 
            placeholder='Enter merchant name...' 
            value={merchantName} 
            onChange={(e)=> setMerchantName(e.target.value)}
            />

            <input
            type="number"
            placeholder="Enter amount..."
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            />

            <input
            type="date"
            value={dateOfTrans.toISOString().split('T')[0]}
            onChange={(e) => setDateOfTrans(new Date(e.target.value))}
            />

            <button onClick={addEditTrans}>{transEditID === null ? 'Add' : 'Update'}</button>
        </div>
        {transactionList.map(trans=>(
          <div key={trans.id}>
            <p>Transaction: {trans.transaction}</p>
            <p>Card used: {trans.cardName}</p>
            <p>Merchant name:{trans.merchantName}</p>
            <p>Amount: {trans.amount}</p>
            <p>Transaction date: {trans.transactionDate}</p>
            {transEditID === null && <button onClick={()=>startTransEdit(trans)}>Edit</button>}
            <button onClick={()=>deleteTrans(trans.id)}>Delete</button>
          </div>
        ))}

        {currentPage === 'Transaction' && (
  <>
    {/* ...existing transaction code... */}

    {/* 🔔 Due Soon Transactions Section */}
    <div className='due-soon-section'>
      <h2>🔔 Transactions Near Due Date</h2>
      {dueSoonTransactions.length === 0 ? (
        <p>No upcoming due dates based on recent transactions.</p>
      ) : (
        dueSoonTransactions.map((trans) => {
          const relatedCard = cardList.find(c => c.cardName === trans.cardName);
          return (
            <div key={trans.id} className='due-soon-card'>
              <p><strong>Card:</strong> {trans.cardName}</p>
              <p><strong>Transaction:</strong> {trans.transaction}</p>
              <p><strong>Merchant:</strong> {trans.merchantName}</p>
              <p><strong>Amount:</strong> ₱{trans.amount}</p>
              <p><strong>Transaction Date:</strong> {trans.transactionDate}</p>
              <p><strong>Due Date:</strong> {relatedCard?.dueDate}</p>
            </div>
          );
        })
      )}
    </div>
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
