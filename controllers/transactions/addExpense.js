const { Transaction } = require('../../models/transaction')
const { User } = require('../../models/user')

const addExpense = async (req, res, next) => {
  try {
    const { amount } = req.body
    const userId = req.user._id.toString()
    const transactionData = await Transaction.create({
      ...req.body,
      isIncome: false,
      owner: userId
    })
    res.status(201).json({
      transactionData
    })
    const user = await User.findById(userId)
    user.balance -= amount
    await user.save()
  } catch (error) {
    next(error)
  }
}

module.exports = addExpense
