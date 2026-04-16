-- 사용자 (선생님 + 학부모)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'parent')),
  phone VARCHAR(20),
  must_change_pw BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 학생 (학부모에 연결, 별도 로그인 없음)
CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  parent_id INTEGER REFERENCES users(id),
  name VARCHAR(100) NOT NULL,
  grade VARCHAR(50) NOT NULL,
  school VARCHAR(100),
  pin VARCHAR(4),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 반
CREATE TABLE IF NOT EXISTS classes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  grade_level VARCHAR(50),
  schedule_desc VARCHAR(255),
  max_students INTEGER DEFAULT 10,
  weekly_count INTEGER NOT NULL DEFAULT 2,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 반-학생 매핑
CREATE TABLE IF NOT EXISTS class_students (
  class_id INTEGER REFERENCES classes(id),
  student_id INTEGER REFERENCES students(id),
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (class_id, student_id)
);

-- 수업 일정
CREATE TABLE IF NOT EXISTS lessons (
  id SERIAL PRIMARY KEY,
  class_id INTEGER REFERENCES classes(id),
  lesson_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  topic TEXT,
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'makeup')),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 출결
CREATE TABLE IF NOT EXISTS attendance (
  id SERIAL PRIMARY KEY,
  lesson_id INTEGER REFERENCES lessons(id),
  student_id INTEGER REFERENCES students(id),
  status VARCHAR(20) DEFAULT 'absent' CHECK (status IN ('present', 'absent', 'late', 'excused')),
  method VARCHAR(20) CHECK (method IN ('qr', 'manual', 'pin')),
  checked_at TIMESTAMPTZ,
  checked_out_at TIMESTAMPTZ,
  UNIQUE (lesson_id, student_id)
);

-- QR 입퇴실 방문 기록 (수업 무관, 하루 1회)
CREATE TABLE IF NOT EXISTS room_visits (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id),
  visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  checked_in_at TIMESTAMPTZ,
  checked_out_at TIMESTAMPTZ,
  UNIQUE (student_id, visit_date)
);

-- QR 토큰 (수업별 1회용)
CREATE TABLE IF NOT EXISTS qr_tokens (
  id SERIAL PRIMARY KEY,
  token UUID DEFAULT gen_random_uuid() NOT NULL UNIQUE,
  lesson_id INTEGER REFERENCES lessons(id),
  expires_at TIMESTAMPTZ NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 수업 일지
CREATE TABLE IF NOT EXISTS lesson_logs (
  id SERIAL PRIMARY KEY,
  lesson_id INTEGER REFERENCES lessons(id) UNIQUE,
  content TEXT NOT NULL,
  homework TEXT,
  shared_with_parent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 성적
CREATE TABLE IF NOT EXISTS scores (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id),
  class_id INTEGER REFERENCES classes(id),
  exam_name VARCHAR(200) NOT NULL,
  score NUMERIC(5,1) NOT NULL,
  max_score NUMERIC(5,1) DEFAULT 100,
  exam_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 면담 가능 시간대 (선생님이 설정)
CREATE TABLE IF NOT EXISTS consultation_slots (
  id SERIAL PRIMARY KEY,
  slot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 면담 예약
CREATE TABLE IF NOT EXISTS consultations (
  id SERIAL PRIMARY KEY,
  slot_id INTEGER REFERENCES consultation_slots(id),
  parent_id INTEGER REFERENCES users(id),
  student_id INTEGER REFERENCES students(id),
  type VARCHAR(20) CHECK (type IN ('in_person', 'phone', 'video')),
  topic TEXT,
  status VARCHAR(20) DEFAULT 'requested' CHECK (status IN ('requested', 'confirmed', 'completed', 'cancelled')),
  parent_memo TEXT,
  teacher_memo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 랜딩페이지 상담 신청 (비로그인)
CREATE TABLE IF NOT EXISTS inquiries (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  grade VARCHAR(20),
  message TEXT,
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'enrolled', 'declined')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 수업료
CREATE TABLE IF NOT EXISTS tuition (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id),
  month VARCHAR(7) NOT NULL,
  amount INTEGER NOT NULL,
  is_paid BOOLEAN DEFAULT FALSE,
  paid_at TIMESTAMPTZ,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (student_id, month)
);

-- 알림장/공지
CREATE TABLE IF NOT EXISTS notices (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  target VARCHAR(20) DEFAULT 'all' CHECK (target IN ('all', 'class', 'individual')),
  target_id INTEGER,
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 시험 문제 상세 (성적 피드백용)
CREATE TABLE IF NOT EXISTS exam_details (
  id              SERIAL PRIMARY KEY,
  score_id        INTEGER NOT NULL REFERENCES scores(id) ON DELETE CASCADE,
  file_url        TEXT,                         -- Google Drive 등 외부 링크 (선택)
  problems        JSONB NOT NULL DEFAULT '[]',  -- ProblemEntry[] {num, topic, correct, points}
  weak_topics     TEXT[] NOT NULL DEFAULT '{}', -- 자동 계산된 취약 단원
  teacher_comment TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (score_id)
);

-- 랜딩페이지 갤러리 이미지
CREATE TABLE IF NOT EXISTS gallery_images (
  id SERIAL PRIMARY KEY,
  url TEXT NOT NULL,
  caption VARCHAR(200),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 결석 사전 신고
CREATE TABLE IF NOT EXISTS absence_requests (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id) NOT NULL,
  absence_date DATE NOT NULL,
  reason TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
  admin_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE UNIQUE INDEX IF NOT EXISTS idx_students_pin ON students(pin) WHERE pin IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_students_parent ON students(parent_id);
CREATE INDEX IF NOT EXISTS idx_students_active ON students(is_active) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_lessons_class_date ON lessons(class_id, lesson_date);
CREATE INDEX IF NOT EXISTS idx_attendance_lesson ON attendance(lesson_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_room_visits_date ON room_visits(visit_date);
CREATE INDEX IF NOT EXISTS idx_qr_tokens_lesson ON qr_tokens(lesson_id);
CREATE INDEX IF NOT EXISTS idx_scores_student ON scores(student_id);
CREATE INDEX IF NOT EXISTS idx_tuition_student ON tuition(student_id);
CREATE INDEX IF NOT EXISTS idx_consultations_parent ON consultations(parent_id);
CREATE INDEX IF NOT EXISTS idx_notices_published ON notices(is_published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_exam_details_score ON exam_details(score_id);
CREATE INDEX IF NOT EXISTS idx_gallery_images_order ON gallery_images(display_order) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_absence_requests_student ON absence_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_absence_requests_status ON absence_requests(status, absence_date);
