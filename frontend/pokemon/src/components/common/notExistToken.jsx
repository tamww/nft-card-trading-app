import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

export default function NotExistToken(){
    const navigate = useNavigate();

    return(
        <Result
        status="404"
        title="404"
        subTitle="Sorry, this token does not exist."
        extra={<Button onClick={()=>(navigate("/main"))} type="primary">Back Home</Button>}
      />
    )
};