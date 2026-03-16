import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// Insert tickets 100-999 in batches of 100
for (let batch = 1; batch <= 9; batch++) {
  const values = [];
  for (let i = batch * 100; i < (batch + 1) * 100; i++) {
    const num = i.toString().padStart(3, '0');
    values.push(`('${num}','available')`);
  }
  const sql = `INSERT INTO tickets (\`number\`, \`status\`) VALUES ${values.join(',')}`;
  await conn.execute(sql);
  console.log(`Inserted batch ${batch}: ${batch * 100}-${(batch + 1) * 100 - 1}`);
}

await conn.end();
console.log('Done! All 1000 tickets seeded.');
