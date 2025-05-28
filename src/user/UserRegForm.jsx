import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UserRegForm = () => {
    const [email, setEmail] = useState('');
    const [username, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [isEmailAvailable, setIsEmailAvailable] = useState(null);
    const [isUsernameAvailable, setIsUsernameAvailable] = useState(null);
    const navigate = useNavigate();
    const [confirmPassword, setConfirmPassword] = useState('');

    const checkEmailDuplicate = async () => {
        try {
            console.log("Checking email:", email);
            const response = await axios.get(`http://localhost:8000/users/checkemail/${email}`);
            console.log("일로 잘 들어옴,");
            if (response.data.message === 'Email available') {
                setIsEmailAvailable(true);
                alert('사용 가능한 이메일입니다.');
            }
        } catch (err) {
            if (err.response && err.response.status === 409) {
                setIsEmailAvailable(false);
                alert('이미 등록된 이메일입니다.');
            } else {
                alert('이메일 중복 확인 중 오류가 발생했습니다.');
            }
        }
    };

    const checkUsernameDuplicate = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/users/checkusername/${username}`);
            if (response.data.message === 'Username available') {
                setIsUsernameAvailable(true);
                alert('사용 가능한 닉네임입니다.');
            }
        } catch (err) {
            if (err.response && err.response.status === 409) {
                setIsUsernameAvailable(false);
                alert('이미 등록된 닉네임입니다.');
            } else {
                alert('닉네임 중복 확인 중 오류가 발생했습니다.');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isEmailAvailable || !isUsernameAvailable) {
            alert("이메일 또는 닉네임 중복 확인이 필요합니다.");
            return;
        }

        if (password !== confirmPassword) {
            alert("비밀번호가 일치하지 않습니다.");
            return;
        }

        try {
            console.log("일로 들어옴. ")
            const response = await axios.post('http://localhost:8000/users/signup', {
                email: email,
                username: username,
                password: password,
                role: 'user'
            });
            alert('회원가입이 완료되었습니다!');
            navigate("/login");
        } catch (err) {
            console.error("회원가입 오류:", err)
            alert("회원가입 중 오류가 발생했습니다.");
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
            <h2>회원가입</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '300px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}> {/* flex 추가 */}
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setIsEmailAvailable(null); }} // 입력 변경 시 중복 확인 상태 초기화
                        placeholder="이메일을 입력하세요."
                        required
                        style={{ flexGrow: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                    <button
                        type="button"
                        onClick={checkEmailDuplicate}
                        style={{
                            padding: '6px 12px', // 패딩 감소
                            fontSize: '0.85em', // 폰트 크기 감소
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap' // 텍스트 줄바꿈 방지
                        }}
                    >
                        중복 확인
                    </button>
                </div>
                {isEmailAvailable === false && <p style={{ color: 'red', fontSize: '0.8em', margin: '0 0 5px 0' }}>이미 등록된 이메일입니다.</p>}
                {isEmailAvailable === true && <p style={{ color: 'green', fontSize: '0.8em', margin: '0 0 5px 0' }}>사용 가능한 이메일입니다.</p>}

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}> {/* flex 추가 */}
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => { setUserName(e.target.value); setIsUsernameAvailable(null); }} // 입력 변경 시 중복 확인 상태 초기화
                        placeholder="닉네임을 입력하세요."
                        required
                        style={{ flexGrow: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                    <button
                        type="button"
                        onClick={checkUsernameDuplicate}
                        style={{
                            padding: '6px 12px', // 패딩 감소
                            fontSize: '0.85em', // 폰트 크기 감소
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        중복 확인
                    </button>
                </div>
                {isUsernameAvailable === false && <p style={{ color: 'red', fontSize: '0.8em', margin: '0 0 5px 0' }}>이미 등록된 닉네임입니다.</p>}
                {isUsernameAvailable === true && <p style={{ color: 'green', fontSize: '0.8em', margin: '0 0 5px 0' }}>사용 가능한 닉네임입니다.</p>}

                <div>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="비밀번호를 입력하세요."
                        required
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>
                <div>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="비밀번호를 한번 더 입력하세요."
                        required
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>
                <button
                    type="submit"
                    style={{
                        padding: '10px 20px', // 메인 버튼은 조금 더 크게 유지
                        fontSize: '1em',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginTop: '10px'
                    }}
                >
                    회원가입
                </button>
            </form>
        </div>
    );
};

export default UserRegForm;