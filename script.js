function calculate() {
  const basic = parseFloat(document.getElementById("basic").value) || 0;
  const da = parseFloat(document.getElementById("da").value) || 0;
  const fitment = parseFloat(document.getElementById("fitment").value) || 1;
  const hraRate = parseFloat(document.getElementById("hra").value);
  const mergeDA = document.getElementById("mergeDA").checked;

  let adjustedBasic = basic;

  if (mergeDA) {
    adjustedBasic = basic * (1 + da / 100);
  }

  const newBasic = adjustedBasic * fitment;
  const hra = newBasic * hraRate;

  const total = newBasic + hra;

  document.getElementById("result").innerHTML = `
    <p><strong>New Basic:</strong> ₹${newBasic.toFixed(0)}</p>
    <p><strong>HRA:</strong> ₹${hra.toFixed(0)}</p>
    <p><strong>Total Salary:</strong> ₹${total.toFixed(0)}</p>
  `;
}