import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage(){
    const navigate = useNavigate();

    return(
        <Result
        status="404"
        title="404"
        subTitle="Sorry, the page you visited does not exist."
        extra={<Button onClick={()=>(navigate("/main"))} type="primary">Back Home</Button>}
      />
    )
};