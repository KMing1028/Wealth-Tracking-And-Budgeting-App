// Realistic Malaysian sample data
export function generateSampleWealth() {
  const now = new Date();
  const yearAgo = new Date(now); yearAgo.setFullYear(now.getFullYear() - 1);
  const sixMonthsAgo = new Date(now); sixMonthsAgo.setMonth(now.getMonth() - 6);
  const threeMonthsAgo = new Date(now); threeMonthsAgo.setMonth(now.getMonth() - 3);
  const oneMonthAgo = new Date(now); oneMonthAgo.setMonth(now.getMonth() - 1);

  return [
    {
      id: 'sample-savings-1',
      category: 'savings',
      name: 'Maybank Savings',
      currentValue: 85000,
      entries: [
        { date: yearAgo.toISOString(), value: 72000 },
        { date: sixMonthsAgo.toISOString(), value: 78500 },
        { date: threeMonthsAgo.toISOString(), value: 82000 },
        { date: now.toISOString(), value: 85000 },
      ],
      createdAt: yearAgo.toISOString(),
    },
    {
      id: 'sample-stocks-1',
      category: 'stocks',
      name: 'Bursa Malaysia',
      currentValue: 48500,
      entries: [
        { date: yearAgo.toISOString(), value: 41000 },
        { date: sixMonthsAgo.toISOString(), value: 44200 },
        { date: threeMonthsAgo.toISOString(), value: 46800 },
        { date: now.toISOString(), value: 48500 },
      ],
      createdAt: yearAgo.toISOString(),
    },
    {
      id: 'sample-stocks-2',
      category: 'stocks',
      name: 'Interactive Brokers',
      currentValue: 62320,
      entries: [
        { date: yearAgo.toISOString(), value: 50000 },
        { date: sixMonthsAgo.toISOString(), value: 55600 },
        { date: threeMonthsAgo.toISOString(), value: 59100 },
        { date: now.toISOString(), value: 62320 },
      ],
      createdAt: yearAgo.toISOString(),
    },
    {
      id: 'sample-retirement-1',
      category: 'retirement',
      name: 'EPF',
      currentValue: 50000,
      entries: [
        { date: yearAgo.toISOString(), value: 42000 },
        { date: sixMonthsAgo.toISOString(), value: 45500 },
        { date: threeMonthsAgo.toISOString(), value: 47800 },
        { date: now.toISOString(), value: 50000 },
      ],
      createdAt: yearAgo.toISOString(),
    },
  ];
}

export function generateSampleBudget() {
  const now = new Date();
  // Current budget cycle starting 27th
  const cycleStart = new Date(now);
  if (now.getDate() >= 27) {
    cycleStart.setDate(27);
  } else {
    cycleStart.setMonth(cycleStart.getMonth() - 1);
    cycleStart.setDate(27);
  }
  const cycleEnd = new Date(cycleStart);
  cycleEnd.setMonth(cycleEnd.getMonth() + 1);
  cycleEnd.setDate(26);

  const makeDate = (daysAgo) => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString();
  };

  return [
    {
      id: 'sample-budget-1',
      monthStartDate: cycleStart.toISOString(),
      monthEndDate: cycleEnd.toISOString(),
      budgetLimit: 6500,
      expenses: [
        { id: 'e1', date: makeDate(2), amount: 1800, category: 'Housing', bucket: 'needs', description: 'Rent' },
        { id: 'e2', date: makeDate(3), amount: 280, category: 'Groceries & Food', bucket: 'needs', description: 'Weekly groceries' },
        { id: 'e3', date: makeDate(5), amount: 150, category: 'Utilities', bucket: 'needs', description: 'Electric & water bill' },
        { id: 'e4', date: makeDate(6), amount: 120, category: 'Transportation', bucket: 'needs', description: 'Fuel' },
        { id: 'e5', date: makeDate(8), amount: 350, category: 'Dining Out & Entertainment', bucket: 'wants', description: 'Dinner with friends' },
        { id: 'e6', date: makeDate(9), amount: 200, category: 'Shopping & Personal Care', bucket: 'wants', description: 'Clothing' },
        { id: 'e7', date: makeDate(10), amount: 50, category: 'Subscriptions', bucket: 'wants', description: 'Netflix, Spotify' },
        { id: 'e8', date: makeDate(12), amount: 500, category: 'Stock Market Investments', bucket: 'save_invest', description: 'Monthly stock purchase' },
        { id: 'e9', date: makeDate(14), amount: 230, category: 'Emergency Fund Top-ups', bucket: 'save_invest', description: 'Emergency fund' },
        { id: 'e10', date: makeDate(15), amount: 280, category: 'Groceries & Food', bucket: 'needs', description: 'Groceries' },
        { id: 'e11', date: makeDate(16), amount: 450, category: 'Dining Out & Entertainment', bucket: 'wants', description: 'Weekend activities' },
        { id: 'e12', date: makeDate(18), amount: 200, category: 'Hobbies & Recreation', bucket: 'wants', description: 'Gym membership' },
      ],
    },
  ];
}
