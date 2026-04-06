const taxConfig = {
  cessRate: 0.04,
  regimes: {
    new: {
      label: "New Regime",
      slabs: [
        { upTo: 400000, rate: 0 },
        { upTo: 800000, rate: 0.05 },
        { upTo: 1200000, rate: 0.1 },
        { upTo: 1600000, rate: 0.15 },
        { upTo: 2000000, rate: 0.2 },
        { upTo: 2400000, rate: 0.25 },
        { upTo: Infinity, rate: 0.3 }
      ],
      rebate87AThreshold: 1200000
    }
  }
};

const form = document.getElementById("tax-form");
const errorEl = document.getElementById("form-error");
const slabBreakdown = document.getElementById("slabBreakdown");

const output = {
  grossIncome: document.getElementById("grossIncome"),
  taxableIncome: document.getElementById("taxableIncome"),
  taxBeforeCess: document.getElementById("taxBeforeCess"),
  cess: document.getElementById("cess"),
  totalTax: document.getElementById("totalTax")
};

const formatINR = (num) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
    Math.max(0, Math.round(num))
  );

function computeTax(income, deductions, regimeKey) {
  const regime = taxConfig.regimes[regimeKey];
  const taxableIncome = Math.max(0, income - deductions);

  let remaining = taxableIncome;
  let previousLimit = 0;
  let taxBeforeCess = 0;
  const slabItems = [];

  for (const slab of regime.slabs) {
    if (remaining <= 0) break;

    const slabUpper = slab.upTo;
    const slabWidth = slabUpper === Infinity ? remaining : slabUpper - previousLimit;
    const amountInSlab = Math.min(remaining, slabWidth);
    const slabTax = amountInSlab * slab.rate;

    slabItems.push({
      range: slabUpper === Infinity ? `Above ₹${previousLimit.toLocaleString("en-IN")}` : `₹${previousLimit.toLocaleString("en-IN")} - ₹${slabUpper.toLocaleString("en-IN")}`,
      amount: amountInSlab,
      rate: slab.rate,
      tax: slabTax
    });

    taxBeforeCess += slabTax;
    remaining -= amountInSlab;
    previousLimit = slabUpper;
  }

  if (taxableIncome <= regime.rebate87AThreshold) {
    taxBeforeCess = 0;
    slabItems.push({
      range: "Section 87A rebate",
      amount: 0,
      rate: 0,
      tax: 0,
      note: "Tax reduced to zero for eligible income"
    });
  }

  const cess = taxBeforeCess * taxConfig.cessRate;
  const totalTax = taxBeforeCess + cess;

  return { income, taxableIncome, taxBeforeCess, cess, totalTax, slabItems };
}

function render(result) {
  output.grossIncome.textContent = formatINR(result.income);
  output.taxableIncome.textContent = formatINR(result.taxableIncome);
  output.taxBeforeCess.textContent = formatINR(result.taxBeforeCess);
  output.cess.textContent = formatINR(result.cess);
  output.totalTax.textContent = formatINR(result.totalTax);

  slabBreakdown.innerHTML = "";
  result.slabItems.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = `${item.range}: ${formatINR(item.amount)} at ${(item.rate * 100).toFixed(0)}% → ${formatINR(item.tax)}${
      item.note ? ` (${item.note})` : ""
    }`;
    slabBreakdown.appendChild(li);
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  errorEl.textContent = "";

  const income = Number(form.annualIncome.value);
  const deductions = Number(form.deductions.value || 0);
  const regimeKey = form.regime.value;

  if (!Number.isFinite(income) || income < 0) {
    errorEl.textContent = "Please enter a valid non-negative annual income.";
    return;
  }

  if (!Number.isFinite(deductions) || deductions < 0) {
    errorEl.textContent = "Please enter a valid non-negative deductions value.";
    return;
  }

  if (deductions > income) {
    errorEl.textContent = "Deductions cannot be greater than annual income.";
    return;
  }

  const result = computeTax(income, deductions, regimeKey);
  render(result);
});
