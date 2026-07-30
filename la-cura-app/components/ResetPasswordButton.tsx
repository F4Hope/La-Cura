"use client";

type Props={
  email:string;
};

export default function ResetPasswordButton({
  email
}:Props){

  async function send(){

    const response=await fetch(
      "/api/staff/reset-password",
      {
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({email})
      }
    );

    if(response.ok){

      alert("Reset email sent.");

    }else{

      alert("Unable to send email.");

    }

  }

  return(

    <button
      onClick={send}
      className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg"
    >
      Reset Password
    </button>

  );

}