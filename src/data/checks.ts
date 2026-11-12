// Questions (no answers) for every "เช็คพื้นฐานก่อนเรียน" quiz. Used by the student pages and the teacher page.
// Answer keys + solutions live encrypted in src/data/check-keys.json under the same id, in the same order.
export interface Question {
  /** shown above the question, e.g. "พื้นฐาน" or "แนว 1.2" */
  label: string;
  text: string;
  /** 'num': one or more number boxes; 'mc': pick one option */
  kind: 'num' | 'mc';
  parts?: { label?: string; unit?: string }[];
  joiner?: string;
  options?: string[];
}

// Work and Power pre/post test (Pelangi 6.1, ม.2): item k of the pre-test and item k of the post-test are the same type and level.
const gk = 'Take g = 10 N/kg.';
const WORK_PRE: Question[] = [
  { label: '1 · Work or no work (L1)', kind: 'mc', text: 'In which case is work done on the object?',
    options: ['A girl holds a heavy bag still for 5 minutes.', 'A man pushes hard on a wall that does not move.', 'A boy lifts a box from the floor onto a shelf.', 'A student carries a bag along a flat corridor at the same height.'] },
  { label: '2 · Unit of power (L1)', kind: 'mc', text: 'A machine does 1 joule of work every second. What is its power?',
    options: ['1 N', '1 W', '1 J', '1 N·m'] },
  { label: '3 · W = F × s, units (L1)', kind: 'num', text: 'A boy pushes a box with a force of 40 N. The box moves 250 cm in the direction of the force. How much work does he do?', parts: [{ unit: 'J' }] },
  { label: '4 · P = W ÷ t, units (L1)', kind: 'num', text: 'A motor does 12 000 J of work in 2 minutes. What is its power?', parts: [{ unit: 'W' }] },
  { label: '5 · Find the force (L2)', kind: 'num', text: '800 J of work is done to push a crate 20 m along the floor. The force is in the direction of motion. What force is used?', parts: [{ unit: 'N' }] },
  { label: '6 · Mass → weight (L2)', kind: 'num', text: `A 6 kg box is lifted straight up 1.5 m at a steady speed. How much work is done? ${gk}`, parts: [{ unit: 'J' }] },
  { label: '7 · Two stages (L2)', kind: 'num', text: `A worker lifts a 20 kg sack 2 m up onto his shoulder. Then he carries it 10 m along a flat path at the same height. How much work does he do on the sack in total? ${gk}`, parts: [{ unit: 'J' }] },
  { label: '8 · Friction + power (L2)', kind: 'num', text: 'A sledge is pulled at a constant speed for 30 m. The friction on it is 50 N. It takes 20 s. What is the power of the pull?', parts: [{ unit: 'W' }] },
  { label: '9 · Climbing stairs (L2)', kind: 'num', text: `A 50 kg student runs up 24 steps. Each step is 15 cm high. It takes 9 s. What is the student's power? ${gk}`, parts: [{ unit: 'W' }] },
  { label: '10 · Compare power (L2)', kind: 'mc', text: 'Ann and Ben each weigh 500 N. They climb the same stairs. Ann takes 10 s and Ben takes 8 s. Which is correct?',
    options: ['Ann does more work, because she takes longer.', 'They do the same work, and Ben has more power.', 'They do the same work, and Ann has more power.', 'Ben does more work, and they have the same power.'] },
];
const WORK_POST: Question[] = [
  { label: '1 · Work or no work (L1)', kind: 'mc', text: 'In which case is work done on the object?',
    options: ['A waiter holds a tray still while he waits.', 'A boy carries a box along a flat path at the same height.', 'A man pushes hard on a parked truck that does not move.', 'A girl pulls a sledge across the snow.'] },
  { label: '2 · Unit of power (L1)', kind: 'mc', text: 'Which unit is the same as 1 watt?',
    options: ['1 J·s', '1 N·m', '1 J/s', '1 N/s'] },
  { label: '3 · W = F × s, units (L1)', kind: 'num', text: 'A girl pulls a trolley with a force of 60 N. The trolley moves 150 cm in the direction of the force. How much work does she do?', parts: [{ unit: 'J' }] },
  { label: '4 · P = W ÷ t, units (L1)', kind: 'num', text: 'A pump does 36 000 J of work in 3 minutes. What is its power?', parts: [{ unit: 'W' }] },
  { label: '5 · Find the force (L2)', kind: 'num', text: '450 J of work is done to push a cart 15 m along the floor. The force is in the direction of motion. What force is used?', parts: [{ unit: 'N' }] },
  { label: '6 · Mass → weight (L2)', kind: 'num', text: `An 8 kg bag is lifted straight up 1.2 m at a steady speed. How much work is done? ${gk}`, parts: [{ unit: 'J' }] },
  { label: '7 · Two stages (L2)', kind: 'num', text: `A porter lifts a 15 kg box 1.6 m up onto his shoulder. Then he carries it 12 m along a flat corridor at the same height. How much work does he do on the box in total? ${gk}`, parts: [{ unit: 'J' }] },
  { label: '8 · Friction + power (L2)', kind: 'num', text: 'A box is pushed at a constant speed for 24 m. The friction on it is 60 N. It takes 16 s. What is the power of the push?', parts: [{ unit: 'W' }] },
  { label: '9 · Climbing stairs (L2)', kind: 'num', text: `A 45 kg student runs up 20 steps. Each step is 18 cm high. It takes 6 s. What is the student's power? ${gk}`, parts: [{ unit: 'W' }] },
  { label: '10 · Compare power (L2)', kind: 'mc', text: 'Kim and Lee each lift an identical 10 kg box onto the same shelf. Kim takes 4 s and Lee takes 8 s. Which is correct?',
    options: ['They do the same work, and Kim has more power.', 'Lee does more work, because he takes longer.', 'They do the same work, and Lee has more power.', 'Kim does more work, and they have the same power.'] },
];

const g = 'ใช้ g = 10 m/s², sin 37° = 0.6, cos 37° = 0.8';

export const checks: Record<string, { title: string; questions: Question[] }> = {
  'circular-1': { title: 'การเคลื่อนที่แบบวงกลม', questions: [
    { label: 'พื้นฐาน', kind: 'num', text: 'แรง 10 N ทำมุม 37° กับแนวราบ จงแตกเป็นองค์ประกอบแนวราบและแนวดิ่ง',
      parts: [{ label: 'แนวราบ', unit: 'N' }, { label: 'แนวดิ่ง', unit: 'N' }] },
    { label: 'พื้นฐาน', kind: 'num', text: 'แรงลัพธ์ 10 N กระทำต่อมวล 2 kg ความเร่งเท่าใด', parts: [{ unit: 'm/s²' }] },
    { label: 'พื้นฐาน', kind: 'num', text: 'ปล่อยลูกบอลจากที่สูง 5 m อัตราเร็วขณะถึงพื้นเท่าใด (g = 10 m/s²)', parts: [{ unit: 'm/s' }] },
    { label: 'พื้นฐาน', kind: 'mc', text: 'วัตถุเคลื่อนที่เป็นวงกลมด้วยอัตราเร็วคงตัว ข้อใดถูกต้อง',
      options: ['ไม่มีความเร่ง เพราะอัตราเร็วคงตัว', 'มีความเร่ง เพราะทิศของความเร็วเปลี่ยนตลอดเวลา', 'มีความเร่ง เพราะมีแรงหนีศูนย์กลางกระทำ', 'ไม่มีความเร่ง เพราะแรงที่กระทำสมดุลกัน'] },
    { label: 'พื้นฐาน', kind: 'num', text: 'จงทำ √300 ให้อยู่ในรูปอย่างง่าย a√b', joiner: '√', parts: [{}, {}] },
    { label: 'คาบและความถี่', kind: 'num', text: 'ล้อหมุน 120 รอบต่อนาที คาบของการหมุนเท่าใด', parts: [{ unit: 's' }] },
    { label: 'วงกลมแนวราบ', kind: 'num', text: 'ลูกบอลมวล 0.2 kg ผูกเชือกยาว 0.5 m แกว่งเป็นวงกลมบนโต๊ะลื่นในแนวราบด้วยอัตราเร็ว 5 m/s แรงตึงเชือกเท่าใด', parts: [{ unit: 'N' }] },
    { label: 'จุดบนสุด/ล่างสุด', kind: 'num', text: 'รถมวล 1000 kg วิ่งข้ามยอดเนินที่มีรัศมีความโค้ง 20 m ด้วยอัตราเร็ว 10 m/s ถนนดันรถขึ้นด้วยแรงเท่าใด (g = 10 m/s²)', parts: [{ unit: 'N' }] },
    { label: 'ทางโค้งเอียง', kind: 'mc', text: 'รถเลี้ยวบนทางโค้งที่ยกขอบเอียง และถนนลื่นสนิท (ไม่มีแรงเสียดทาน) แรงใดทำหน้าที่เป็นแรงสู่ศูนย์กลาง',
      options: ['แรงเสียดทานระหว่างยางกับถนน', 'น้ำหนักของรถ', 'องค์ประกอบแนวราบของแรงที่ถนนดันรถ (ตั้งฉากกับถนน)', 'แรงหนีศูนย์กลาง'] },
    { label: 'วงกลมแนวดิ่ง + พลังงาน', kind: 'num', text: 'ลูกตุ้มผูกเชือกยาว 0.8 m ดึงให้เชือกตึงในแนวราบแล้วปล่อยจากหยุดนิ่ง ที่จุดต่ำสุดลูกตุ้มมีอัตราเร็วเท่าใด (g = 10 m/s²)', parts: [{ unit: 'm/s' }] },
  ] },
  'buoyancy-1': { title: 'แรงลอยตัว', questions: [
    { label: 'พื้นฐาน', kind: 'num', text: 'ไม้มวล 2 kg ปริมาตร 4 L มีความหนาแน่นเท่าใด', parts: [{ unit: 'kg/m³' }] },
    { label: 'พื้นฐาน', kind: 'mc', text: '250 cm³ เท่ากับกี่ m³', options: ['2.5 × 10⁻¹ m³', '2.5 × 10⁻² m³', '2.5 × 10⁻⁴ m³', '2.5 × 10⁻⁶ m³'] },
    { label: 'พื้นฐาน', kind: 'num', text: 'ความดันของน้ำที่ความลึก 2 m เป็นเท่าใด (ไม่คิดความดันบรรยากาศ, g = 10 m/s², ความหนาแน่นน้ำ 1000 kg/m³)', parts: [{ unit: 'Pa' }] },
    { label: 'พื้นฐาน', kind: 'num', text: 'กล่องมวล 3 kg วางนิ่งบนพื้น มีเชือกดึงกล่องขึ้นด้วยแรง 10 N พื้นดันกล่องด้วยแรงเท่าใด (g = 10 m/s²)', parts: [{ unit: 'N' }] },
    { label: 'พื้นฐาน', kind: 'num', text: 'ความดัน 5000 Pa กระทำบนพื้นที่ 0.02 m² เกิดแรงเท่าใด', parts: [{ unit: 'N' }] },
    { label: 'วัตถุจมมิด', kind: 'num', text: 'วัตถุปริมาตร 500 cm³ จมมิดในน้ำ แรงลอยตัวเท่าใด (g = 10 m/s²)', parts: [{ unit: 'N' }] },
    { label: 'วัตถุลอย', kind: 'num', text: 'ไม้ความหนาแน่น 800 kg/m³ ลอยนิ่งในน้ำ ส่วนที่จมคิดเป็นร้อยละเท่าใดของปริมาตรทั้งก้อน', parts: [{ unit: '%' }] },
    { label: 'เชือกและเครื่องชั่งสปริง', kind: 'num', text: 'ก้อนโลหะหนัก 30 N ปริมาตร 1 L แขวนด้วยเครื่องชั่งสปริงแล้วหย่อนให้จมมิดในน้ำ เครื่องชั่งสปริงอ่านได้เท่าใด', parts: [{ unit: 'N' }] },
    { label: 'ระดับน้ำเปลี่ยน', kind: 'num', text: 'ภาชนะทรงกระบอกพื้นที่ก้น 100 cm² มีน้ำอยู่ ใส่ก้อนหินปริมาตร 200 cm³ ลงไปจนจมก้น ระดับน้ำสูงขึ้นกี่เซนติเมตร', parts: [{ unit: 'cm' }] },
    { label: 'ภาชนะที่มีความเร่ง', kind: 'mc', text: 'ถังน้ำมีไม้ลอยอยู่ วางในลิฟต์ เมื่อลิฟต์เริ่มเร่งขึ้น ไม้จะเป็นอย่างไร',
      options: ['จมมากขึ้น', 'จมน้อยลง', 'จมเท่าเดิม', 'จมมิดน้ำ'] },
  ] },
  'circular-2': { title: 'ทดสอบความรู้เรื่องการเคลื่อนที่วงกลม', questions: [
    { label: 'สกิล: เวกเตอร์ความเร็วเปลี่ยนทิศ', kind: 'num', text: 'วัตถุวิ่งเป็นวงกลมด้วยอัตราเร็วคงตัว 5 m/s เมื่อวิ่งไปได้ ¼ รอบ ความเร็วเปลี่ยนไป (|Δv|) เท่าใด', parts: [{ unit: 'm/s' }] },
    { label: 'สกิล: แตกแรง ΣF = ma ในแนวราบ', kind: 'num', text: `แขวนลูกตุ้ม 0.5 kg ไว้กับเพดานรถที่กำลังเร่งในแนวราบ เชือกเอียงนิ่งทำมุม 37° กับแนวดิ่ง จงหาแรงตึงเชือกและความเร่งของรถ (${g})`,
      parts: [{ label: 'T =', unit: 'N' }, { label: 'a =', unit: 'm/s²' }] },
    { label: 'สกิล: ทิศของแรงลัพธ์', kind: 'mc', text: 'แกว่งลูกตุ้มเป็นวงกลมในแนวดิ่ง ขณะที่เชือกอยู่ในแนวราบพอดี แรงลัพธ์บนลูกตุ้มมีทิศใด',
      options: ['ชี้เข้าหาศูนย์กลางพอดี', 'ชี้ลงในแนวดิ่ง', 'เฉียงลงและเข้าหาศูนย์กลาง', 'ชี้ไปตามทิศการเคลื่อนที่'] },
    { label: 'สกิล: ความสูงจากมุมเชือก + พลังงาน', kind: 'num', text: 'ลูกตุ้มผูกเชือกยาว 1 m ดึงให้เชือกทำมุม 60° กับแนวดิ่งแล้วปล่อยจากหยุดนิ่ง ที่จุดต่ำสุดลูกตุ้มมีอัตราเร็วเท่าใด (g = 10 m/s²)', parts: [{ unit: 'm/s' }] },
    { label: 'แนว 1.1 คาบ ความถี่ อัตราเร็ว', kind: 'num', text: 'จานหมุน 300 รอบต่อนาที จุดที่ห่างแกน 0.2 m มีอัตราเร็วและความเร่งสู่ศูนย์กลางเท่าใด',
      parts: [{ label: 'v =', unit: 'm/s' }, { label: 'a =', unit: 'm/s²' }] },
    { label: 'แนว 1.2 สองมวลบนเชือกเส้นเดียว', kind: 'num', text: 'ลูกบอลมวลเท่ากัน 2 ลูกร้อยบนเชือกเส้นเดียว ลูกแรกห่างจุดหมุน r ลูกที่สองห่าง 2r แกว่งเป็นวงกลมบนโต๊ะลื่น แรงตึงเชือกช่วงใน (จุดหมุนถึงลูกแรก) เป็นกี่เท่าของแรงตึงช่วงนอก', parts: [{ unit: 'เท่า' }] },
    { label: 'แนว 2.1 จุดบนสุด', kind: 'num', text: 'รถวิ่งข้ามยอดเนินที่มีรัศมีความโค้ง 40 m (ก) ต้องวิ่งเร็วเท่าใดคนในรถจึงรู้สึกตัวลอย (เบาะไม่ดันเลย) (ข) ถ้าวิ่งด้วยอัตราเร็วครึ่งหนึ่งของข้อ (ก) เบาะดันคนด้วยแรงกี่เปอร์เซ็นต์ของน้ำหนัก (g = 10 m/s²)',
      parts: [{ label: '(ก)', unit: 'm/s' }, { label: '(ข)', unit: '%' }] },
    { label: 'แนว 3.1 วงกลมแนวดิ่ง + พลังงาน', kind: 'num', text: 'ลูกบอล 0.2 kg ผูกเชือกยาว 0.5 m แกว่งเป็นวงกลมในแนวดิ่ง เร็วพอให้ผ่านจุดบนสุดได้พอดี (เชือกเกือบหย่อน) ที่จุดต่ำสุดลูกบอลมีอัตราเร็วเท่าใด และแรงตึงเชือกเท่าใด (g = 10 m/s²)',
      parts: [{ label: 'v =', unit: 'm/s' }, { label: 'T =', unit: 'N' }] },
  ] },
  'work-pre': { title: 'Work and Power · Pre-test', questions: WORK_PRE },
  'work-post': { title: 'Work and Power · Post-test', questions: WORK_POST },
};
