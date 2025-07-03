import React from 'react';

function CardForm({ cardName, 
    bankName, 
    lastFour, 
    cardLimit, 
    statementDate, 
    dueDate, 
    setCardName, 
    setBankName, 
    setLastFour, 
    setCardLimit, 
    cardEditID,
    setStatementDate, 
    setDueDate, 
    addEditCard, 
    onSubmit }) {

    return(
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
    )
}
export { CardForm };