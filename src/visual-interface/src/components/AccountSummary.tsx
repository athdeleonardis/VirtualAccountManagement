import { TAccount } from "../../../VirtualAccountManagement/Account/VirtualAccount";

const AccountSummary = ({ name, accounts }: { name: string, accounts: TAccount[] }) => {
  let total = 0;
  accounts.forEach((acc) => total += acc.amount);
  return (
    <div className='Account-Summary'>
      <table>
        <caption>{name}</caption>
        <thead>
          <tr>
            <th>Account</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {
            accounts.map((acc, index) => {
              return <tr key={index}>
                <td>{acc.name}</td>
                <td>{acc.amount}</td>
              </tr>
            })
          }
          <tr>
            <td>Total</td>
            <td>{total}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default AccountSummary;
